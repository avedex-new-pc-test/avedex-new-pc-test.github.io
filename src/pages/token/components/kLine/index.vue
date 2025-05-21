<template>
  <div class="watermark relative" :style="{height: `${kHeight}px`}">
    <div id="tv_chart_container" ref="kline" :style="{ width: '100%', height: '100%' }" />
  </div>
  <div id="kline-draggable" class="w-full cursor-row-resize bg-[--d-2D3037-l-F5F5F5] flex items-center justify-center h-6px"  @mousedown.stop.prevent="drag">
    <Icon name="custom:drag" class="text-4px color-#959A9F"/>
  </div>
</template>

<script setup lang='ts'>
import type { IChartingLibraryWidget, ResolutionString, Timezone, SeriesFormat, VisiblePlotsSet, LanguageCode, ChartingLibraryFeatureset } from '~/types/tradingview/charting_library'
import { getTimezone, formatDecimals, getSwapInfo, getAddressAndChainFromId, getWSMessage } from '@/utils'
import { getKlineHistoryData, getUserKlineTxTags } from '@/api/token'
import { getTotalHolders } from '@/api/stats'
import { formatNumber } from '@/utils/formatNumber'
import { switchResolution, formatLang, formatToMarks, supportSecChains, filterLanguage, initTradingViewIntervals, updateChartBackground, buildOrUpdateLastBarFromTx, waitForTradingView } from './utils'
import { useLocalStorage, useElementBounding, useWindowSize } from '@vueuse/core'
import type { WSTx } from './types'
import BigNumber from 'bignumber.js'

const tokenStore = useTokenStore()
const botStore = useBotStore()
const route = useRoute()
const token = computed(() => {
  return route.params.id as string
})

let isReady = false

const chain = computed(() => {
  return getAddressAndChainFromId(token.value)?.chain || tokenStore?.token?.chain
})

const tokenAddress = computed(() => {
  return getAddressAndChainFromId(token.value)?.address || tokenStore?.token?.token
})

const user = computed(() => {
  return botStore.userInfo?.addresses?.find?.(i => i.chain === chain.value)?.address || botStore?.userInfo?.evmAddress
})

const symbol = computed(() => {
  return tokenStore?.token?.symbol || '-'
})

const pair = computed(() => {
  return tokenStore?.pairAddress
})

const amm = computed(() => {
  return tokenStore?.pair?.amm || ''
})

watch(pair, (val) => {
  if (val && val !== '-' && isReady && route.name === 'token-id') {
    const isSupportSecChains = (chain.value && supportSecChains.includes(chain.value)) || false
    resolution.value = initTradingViewIntervals(resolution.value, isSupportSecChains)
    if (_widget) {
      _widget?.resetCache?.()
      _widget?.setSymbol?.(symbol.value + '---' + val, resolution.value as ResolutionString, () => {})
    } else {
      initChart()
    }
  }
})
const price = 0
const wsStore = useWSStore()
const localeStore = useLocaleStore()

const marks = shallowRef([{ id: 'trade', name: '我的' }])

let lastBar: null | {
  close: number
  high: number
  low: number
  open: number
  time: number
  volume: number
} = null

// const LLJEFFY_#_240
const listenerGuidMap = new Map()

const resolution = shallowRef('15')
const themeStore = useThemeStore()
let _widget: null | IChartingLibraryWidget = null

const showMarket = useLocalStorage('tv_showMarket', false)

// 切换主题
watch(() => themeStore.theme, () => {
  resetChart()
})

// 切换语言
watch(() => localeStore.locale, () => {
  resetChart()
})

function resetChart() {
  _widget?.remove?.()
  initChart()
}



function _getTotalHolders() {
  getTotalHolders(token.value).then(res => {
    console.log(res)
    marks.value = [{ id: 'trade', name: '我的' }].concat(res?.map((i) => ({
      id: i.type,
      name: i?.[filterLanguage(localeStore.locale)] + (i.type !== '31' ? `(${i?.total_address})` : '')
    })))
  })
}

function saveStudy() {
  if (_widget?.activeChart) {
    const studies = _widget?.activeChart?.().getAllStudies()
    localStorage.setItem('tradingViewStudies', JSON.stringify(studies.filter(i => i.name !== 'Volume')))
  }
}

// 创建指标
function createStudy() {
  if (_widget?.activeChart) {
    // let studies = storage.get('tradingViewStudies')
    const studies: Array<{ name: string }> = JSON.parse(localStorage.getItem('tradingViewStudies') || '[]')
    studies.forEach(i => {
      _widget?.activeChart?.().createStudy(i.name, false, false)
    })
    if (localStorage['tradingview.chart.favoriteLibraryIndicators']) {
      const indicators: Array<string> = JSON.parse(localStorage['tradingview.chart.favoriteLibraryIndicators'])
      indicators.forEach(i => {
        _widget?.activeChart?.().createStudy(i, false, false)
      })
    }
    // this.createPositionPriceLine()
    // this.createMigratePriceLine()
  }
}

// 创建 市值/价格 切换按钮
function createToggleButton() {
  const btn = _widget?.createButton()
  if (!btn) return

  const updateButtonContent = () => {
    const isShowMarket = showMarket.value
    btn.innerHTML = `
        <span style="font-size: 12px; cursor: pointer;">
          ${isShowMarket ? 'Price / <span style="color:#286DFF">MCap</span>' : '<span style="color:#286DFF">Price</span> / MCap'}
        </span>`
  }

  btn.onclick = () => {
    showMarket.value = !showMarket.value
    updateButtonContent()
    resetChart()
  }
  updateButtonContent()
}

async function initChart() {
  const symbolUp = symbol.value?.toUpperCase?.() || '-'
  // const widget = (window as any).TradingView.widget as ChartingLibraryWidgetConstructor
  // console.log('widget', window.TradingView)
  const isSupportSecChains = (chain.value && supportSecChains.includes(chain.value)) || false
  // 初始化 resolutions
  resolution.value = initTradingViewIntervals(resolution.value, isSupportSecChains)
  const urlPrefix = useConfigStore().globalConfig?.token_logo_url || 'https://www.iconaves.com/'
  const widget = await waitForTradingView()
  _widget = new widget({
    symbol: symbolUp.replace('<', '＜') || ' ',
    debug: false,
    width: '100%' as any,
    height: '100%' as any,
    interval: resolution.value as any,
    theme: themeStore.theme,
    container: 'tv_chart_container',
    library_path: `${urlPrefix}charting_library-29.2.0/charting_library/`,
    locale: formatLang(localeStore.locale) as LanguageCode,
    disabled_features: [
      'header_symbol_search',
      // 'header_fullscreen_button',
      'header_screenshot',
      'header_compare',
      'volume_force_overlay',
      'header_undo_redo',
      'header_settings',
      'header_saveload',
      'timeframes_toolbar',
    ],
    enabled_features: [
      ...(isSupportSecChains ? ['seconds_resolution' as ChartingLibraryFeatureset] : [])
    ],
    charts_storage_url: location.host,
    charts_storage_api_version: '1.1',
    timezone: getTimezone() as Timezone,
    time_frames: [],
    custom_css_url: `${location.origin}/tv_custom.css`,
    // format: (showMarket.value ? 'volume' : 'price') as SeriesFormat,
    custom_formatters: {
      priceFormatterFactory: () => {
        return {
          format: (price) => {
            return String(formatNumber(price, showMarket.value ? 2 : 3))
          },
        }
      }
    },
    overrides: {
      volumePaneSize: 'small',
      'paneProperties.topMargin': '10',
      // "scalesProperties.lineColor": '#333',
      'scalesProperties.textColor': themeStore.isDark ? '#d5d5d5' : '#333',
      'paneProperties.backgroundType': 'solid',
      'paneProperties.background': themeStore.isDark ? '#0A0B0D' : '#fff',
      'paneProperties.vertGridProperties.style': 2,
      // "paneProperties.vertGridProperties.color": style.grid,
      // "paneProperties.horzGridProperties.style": 2,
      // "paneProperties.horzGridProperties.color": style.grid,
      // "paneProperties.crossHairProperties.color": style.cross,
      'paneProperties.legendProperties.showLegend': false,
      'paneProperties.legendProperties.showStudyArguments': true,
      'paneProperties.legendProperties.showStudyTitles': true,
      'paneProperties.legendProperties.showStudyValues': true,
      'paneProperties.legendProperties.showSeriesTitle': true,
      'paneProperties.legendProperties.showSeriesOHLC': true,
      // "mainSeriesProperties.candleStyle.upColor": style.up,
      // "mainSeriesProperties.candleStyle.downColor": style.down,
      'mainSeriesProperties.candleStyle.drawWick': true,
      'mainSeriesProperties.candleStyle.drawBorder': true,
      // "mainSeriesProperties.candleStyle.borderColor": style.border,
      // "mainSeriesProperties.candleStyle.borderUpColor": style.up,
      // "mainSeriesProperties.candleStyle.borderDownColor": style.down,
      // "mainSeriesProperties.candleStyle.wickUpColor": style.up,
      // "mainSeriesProperties.candleStyle.wickDownColor": style.down,
      'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
      // "mainSeriesProperties.hollowCandleStyle.upColor": style.up,
      // "mainSeriesProperties.hollowCandleStyle.downColor": style.down,
      'mainSeriesProperties.hollowCandleStyle.drawWick': true,
      'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
      // "mainSeriesProperties.hollowCandleStyle.borderColor": style.border,
      // "mainSeriesProperties.hollowCandleStyle.borderUpColor": style.up,
      // "mainSeriesProperties.hollowCandleStyle.borderDownColor": style.down,
      // "mainSeriesProperties.hollowCandleStyle.wickColor": style.line,
      // "mainSeriesProperties.haStyle.upColor": style.up,
      // "mainSeriesProperties.haStyle.downColor": style.down,
      'mainSeriesProperties.haStyle.drawWick': true,
      'mainSeriesProperties.haStyle.drawBorder': true,
      // "mainSeriesProperties.haStyle.borderColor": style.border,
      // "mainSeriesProperties.haStyle.borderUpColor": style.up,
      // "mainSeriesProperties.haStyle.borderDownColor": style.down,
      // "mainSeriesProperties.haStyle.wickColor": style.border,
      'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
      // "mainSeriesProperties.barStyle.upColor": style.up,
      // "mainSeriesProperties.barStyle.downColor": style.down,
      'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
      'mainSeriesProperties.barStyle.dontDrawOpen': false,
      // "mainSeriesProperties.lineStyle.color": style.border,
      'mainSeriesProperties.lineStyle.linewidth': 2,
      'mainSeriesProperties.lineStyle.priceSource': 'close',
      // "mainSeriesProperties.areaStyle.color1": style.areatop,
      // "mainSeriesProperties.areaStyle.color2": style.areadown,
      // "mainSeriesProperties.areaStyle.linecolor": style.border,
      'mainSeriesProperties.areaStyle.linewidth': 2,
      'mainSeriesProperties.areaStyle.priceSource': 'close',
      // 'linetoolhorzline.showLabel': true,
      // 'linetoolhorzline.horzLabelsAlign': 'right',
      // 'linetoolhorzline.vertLabelsAlign': 'bottom',
    },
    datafeed: {
      onReady: callback => {
        // const chain = props.chain
        const isSupportSecChains = chain.value && supportSecChains.includes(chain.value)
        const configurationData = {
          supported_resolutions: ['1S', '1', '5', '15', '30', '60', '120', '240', '1D', '1W'] as ResolutionString[],
          supports_marks: true,
          supports_timescale_marks: true,
          supports_time: true
        }
        if (!isSupportSecChains) {
          configurationData.supported_resolutions = ['1', '5', '15', '30', '60', '120', '240', '1D', '1W'] as ResolutionString[]
        }
        isReady = true
        setTimeout(() => callback(configurationData), 50)
      },
      resolveSymbol: (symbolName, onResolve, onError) => {
        try {
          // const { chain, symbol, price, amm } = props
          const isSupportSecChains = !!(chain.value && supportSecChains?.includes?.(chain.value))
          const symbolUp = symbol.value?.toUpperCase?.() || '-'
          const p = Number(price) || 0
          const symbolInfo = {
            symbol: symbolUp,
            name: symbolUp,
            ticker: symbolUp,
            description: symbolUp?.split?.('---')?.[0] || '',
            exchange: 'Ave.ai',
            timezone: getTimezone() as Timezone,
            format: (showMarket.value ? 'volume' : 'price') as SeriesFormat,
            minmov: 1, // 最小波动
            minmov2: 0, // 格式化复杂情况下的价格 如价格增量
            pricescale: p > 0
              ? 10 ** formatDecimals(p).precision
              : 10000000,
            volume_precision: 10, // 小数位
            fractional: false, // 分数显示价格,1 - xx'yy（例如，133'21)或 2 - xx'yy'zz （例如，133'21'5）
            session: '24x7',
            has_intraday: true, // 显示商品是否具有日内（分钟）历史数据
            intraday_multipliers: ['1', '5', '15', '30', '60', '120', '240'] as ResolutionString[],
            has_seconds: isSupportSecChains,
            seconds_multipliers: ['1'],
            has_daily: true,
            // has_no_volume: false, // 布尔表示商品是否拥有成交量数据
            has_weekly_and_monthly: true,
            supported_resolutions: ['1S', '1', '5', '15', '30', '60', '120', '240', '1D', '1W'] as ResolutionString[], // 在这个商品的周期选择器中启用一个周期数组。 数组的每个项目都是字符串。
            data_status: 'streaming' as 'streaming' | 'endofday' | 'delayed_streaming',
            visible_plots_set: 'ohlcv' as VisiblePlotsSet,
            type: 'crypto',
            listed_exchange: getSwapInfo?.(chain.value || '', amm.value)?.show_name || ''
          }
          if (!isSupportSecChains) {
            symbolInfo.supported_resolutions = ['1', '5', '15', '30', '60', '120', '240', '1D', '1W'] as ResolutionString[]
            symbolInfo.seconds_multipliers = []
          }
          console.log('[resolveSymbol]: Symbol resolved', symbolName)
          setTimeout(() => onResolve(symbolInfo), 0)
        } catch (err) {
          onError(err?.toString?.() || 'resolveSymbol err')
        }
      },
      getBars: (symbolInfo, resolution, periodParams, onResult, onError) => {
        const { from, to, firstDataRequest } = periodParams
        console.log('[getBars]: Method call', symbolInfo, resolution, from, to, firstDataRequest)
        try {
          if (firstDataRequest) {
            const interval = switchResolution(resolution)
            getKlineHistoryData({
              interval: interval,
              pair: pair.value + '-' + chain.value
            }).then(res => {
              console.log('getKlineHistoryData', res)
              const bars = res?.kline_data?.map?.(i => ({
                time: i.time * 1000,
                open: showMarket.value ? new BigNumber(i.open || 0).times(tokenStore?.circulation || 0).toNumber() : i.open,
                high: showMarket.value ? new BigNumber(i.high || 0).times(tokenStore?.circulation || 0).toNumber() : i.high,
                low: showMarket.value ? new BigNumber(i.low || 0).times(tokenStore?.circulation || 0).toNumber() : i.low,
                close: showMarket.value ? new BigNumber(i.close || 0).times(tokenStore?.circulation || 0).toNumber() : i.close,
                volume: i.volume,
              })) || []
              console.log('onResult', bars)
              lastBar = bars?.[bars?.length - 1] || null
              onResult(bars, {noData: bars?.length === 0})
            })
          } else {
            onResult([], { noData: true })
          }
        } catch (err) {
          console.log('[getBars]: Get error', err)
          onError(err?.toString?.() || 'getBars err')
        }
      },
      subscribeBars: (symbolInfo, resolution, onTick, listenerGuid, /*onResetCacheNeededCallback*/) => {
        console.log('listenerGuid', listenerGuid)
        if (listenerGuidMap.has(token.value)) {
          return
        }
        const { address, chain } = getAddressAndChainFromId(token.value)
        const params = [
          'multi_tx',
          address,
          chain
        ]
        const data = {
          jsonrpc: '2.0',
          method: 'subscribe',
          params: params,
          id: 1
        }
        wsStore.send(data)?.onmessage(e => {
          const msg = getWSMessage(e)
          if (!msg) {
            return
          }
          const { event, data } = msg
          if (event === 'tx') {
            const tx: WSTx = data?.tx
            if (tx.pair_address === pair.value) {
              const interval = switchResolution(resolution)
              const t = token.value?.replace?.(/-.*$/, '')
              const newBar = buildOrUpdateLastBarFromTx(tx, t, lastBar, interval)
              if (showMarket.value && newBar) {
                newBar.open = new BigNumber(newBar.open || 0).times(tokenStore?.circulation || 0).toNumber()
                newBar.high = new BigNumber(newBar.high || 0).times(tokenStore?.circulation || 0).toNumber()
                newBar.low = new BigNumber(newBar.low || 0).times(tokenStore?.circulation || 0).toNumber()
                newBar.close = new BigNumber(newBar.close || 0).times(tokenStore?.circulation || 0).toNumber()
              }
              if (newBar) {
                onTick(newBar)
              }
            }
          }
        }, 'kline')
        listenerGuidMap.set(token.value, data)
      },
      unsubscribeBars: (listenerGuid) => {
        if (listenerGuid) {
          const subscribeParams = listenerGuidMap.get(token.value)
          if (subscribeParams.params[1] === tokenAddress.value) {
            return
          }
          subscribeParams.method = 'unsubscribe'
          wsStore.send(subscribeParams)
          listenerGuidMap?.delete?.(token.value)
        }
      },
      searchSymbols: (userInput, exchange, symbolType, onResult) => {
        console.log(userInput, exchange, symbolType, onResult)
      },
      getMarks: (symbolInfo, from, to, onDataCallback, resolution) => {
        console.log(`[getMarks] ${symbolInfo.name} from ${from} to ${to}, resolution: ${resolution}`)
        const interval = switchResolution(resolution)
        getUserKlineTxTags({
          from,
          to,
          interval,
          pair: pair.value + '-' + chain.value,
          token_address: token.value,
          user_address: user.value
        }).then(res => {
          console.log('getUserKlineTxTags', res)
          const marks = formatToMarks(res, interval)
          onDataCallback(marks || [])
        })
      }
    }
  })
  updateChartBackground()
  _widget.onChartReady(() => {
    // 保存指标
    saveStudy()
    if (themeStore.isDark) {
      _widget?.applyOverrides?.({ 'scalesProperties.textColor': '#d5d5d5' })
    } else {
      _widget?.applyOverrides?.({ 'scalesProperties.textColor': '#333' })
    }

    _widget?.activeChart?.()?.onIntervalChanged().subscribe(null, interval => {
      if (resolution.value !== interval) {
        resolution.value = interval
        localStorage.setItem('tv_resolution', interval)
        _widget?.resetCache?.()
      }
    })

    createStudy()
  })

  _widget?.headerReady().then(() => {
    // 创建 市值/价格 切换按钮
    createToggleButton()
  })
  // onMarkClick
  _widget?.subscribe('onMarkClick', (markId) => {
    console.log('markId', markId)
  })
}

// 拖动缩放
let isMask = false
const kHeight = shallowRef(500)
const wHeight = useWindowSize().height
const dom = useTemplateRef('kline')
function drag(e: MouseEvent) {
  let dy = e.clientY
  isMask = true
  // const dom = document.querySelector('#k-line-chart-container')
  if (!dom) {
    return
  }
  const { height } = useElementBounding(dom)
  kHeight.value = height.value
  document.onmousemove = e => {
    if (!isMask) {
      return
    }
    if (e.clientY > wHeight.value) {
      isMask = false
      return
    }
    document.getElementById('tv_chart_container')!.style.pointerEvents = 'none'
    if (e.clientY < dy) {
      kHeight.value -= dy - e.clientY
    } else {
      kHeight.value += e.clientY - dy
    }
    dy = e.clientY
  }
  document.onmouseup = () => {
    document.getElementById('tv_chart_container')!.style.pointerEvents = 'auto'
    isMask = false
    document.onmousemove = null
    document.onmouseup = null
  }
  // e.stopPropagation()
  // e.preventDefault()
  return false
}


onBeforeMount(() => {
  // _getTotalHolders()
})

onMounted(() => {
  initChart()
})

</script>

<style scoped lang="scss">
.watermark {
  position: relative;

  &::after {
    content: 'AVE.AI';
    position: absolute;
    left: 50%;
    top: max(48%, 100px);
    transform: translate(-50%, -50%);
    font-size: 60px;
    text-align: center;
    color: #BCBED2;
    opacity: 0.07;
    pointer-events: none;
    font-weight: 500;
  }
}
</style>
