// import { getGlobalT } from '@/utils/i18nBridge'
import type { Mark, ChartingLibraryWidgetConstructor, IChartingLibraryWidget, EntityId } from '~/types/tradingview/charting_library'
import { formatNumber } from '@/utils/formatNumber'
import type { WSTx, KLineBar  } from './types'
import { useDocumentVisibility } from '@vueuse/core'

export const supportSecChains = ['solana', 'bsc', 'eth', 'base', 'tron']

export function switchResolution(resolution: string) {
  const obj: Record<string, string> = {
    '1D': '1440',
    '1W': '10080'
  }
  let t = obj[resolution] || resolution
  if (t?.endsWith?.('S')) {
    t = t?.slice?.(0, -1)
  } else {
    t = String(Number(t) * 60)
  }
  return t
}


export function formatLang(lang: string) {
  return {
    en: 'en',
    'zh-cn': 'zh',
    'zh-tw': 'zh_TW',
    pt: 'pt',
    es: 'es',
    ru: 'ru',
    tr: 'tr',
    vi: 'vi',

  }?.[lang] || 'en'
}

export function filterLanguage(lang: string)  {
  return ({
    'zh-cn': 'cn',
    'zh-tw': 'tw',
  }?.[lang] || 'en') as 'cn' | 'en' | 'pt' | 'tw' | 'es'
}


type TradeSide = {
  amount: number
  txns: number
  volume: number
}

type TradeData = {
  time: number
  buy?: TradeSide
  sell?: TradeSide
}

export function formatToMarks(
  data: TradeData[],
  interval: number | string
): Mark[] {
  // const t = getGlobalT()
  const result: Mark[] = []
  const bucketMap: Record<string, { time: number; side: 'buy' | 'sell'; amount: number; txns: number; volume: number }> = {}
  const urlPrefix = useConfigStore().globalConfig?.token_logo_url || 'https://www.iconaves.com/'
  // First pass: Aggregate data into buckets
  const interval1 = Number(interval)
  for (const item of data) {
    const bucketTime = Math.floor(item.time / interval1) * interval1

    // Aggregating buy data
    if (item.buy) {
      const key = `${bucketTime}-buy`
      const entry = bucketMap[key] ??= { time: bucketTime, side: 'buy', amount: 0, txns: 0, volume: 0 }
      entry.amount += item.buy.amount
      entry.txns += item.buy.txns
      entry.volume += item.buy.volume
    }

    // Aggregating sell data
    if (item.sell) {
      const key = `${bucketTime}-sell`
      const entry = bucketMap[key] ??= { time: bucketTime, side: 'sell', amount: 0, txns: 0, volume: 0 }
      entry.amount += item.sell.amount
      entry.txns += item.sell.txns
      entry.volume += item.sell.volume
    }
  }

  // Second pass: Convert aggregated data into mark format
  for (const entry of Object.values(bucketMap)) {
    const isBuy = entry.side === 'buy'
    result.push({
      id: `${entry.time}-${entry.side}`,
      time: entry.time,
      // type: 'trade',
      color: { background: 'transparent', border: 'transparent' },
      imageUrl:
      isBuy
        ? `${urlPrefix}signals/marks/mark-buy-trade.png`
        : `${urlPrefix}signals/marks/mark-sell-trade.png`,
      label: isBuy ? 'B' : 'S',
      labelFontColor: '#fff',
      minSize: 20,
      hoveredBorderWidth: 0,
      // position: isBuy ? 'below' : 'above',
      borderWidth: 0,
      text: `${isBuy ? '买' : '卖'} $${formatNumber(entry.volume)} ${formatDate(entry.time, 'HH:mm')}`,
      showLabelWhenImageLoaded: false
    })
  }

  // Sorting only at the end
  return result.sort((a, b) => a.time - b.time)
}


export function initTradingViewIntervals(currentResolution: string, isSupportSecChains: boolean): string {
  const QUICK_KEY = 'tradingview.IntervalWidget.quicks'
  const RESOLUTION_KEY = 'tv_resolution'
  const DEFAULT_LIST = ['1', '5', '15', '60', '240', '1D', '1W']
  const SEC_LIST = ['1S', ...DEFAULT_LIST]

  let list: string[]

  const stored = localStorage.getItem(QUICK_KEY)
  if (!stored) {
    list = isSupportSecChains ? SEC_LIST : DEFAULT_LIST
    localStorage.setItem(QUICK_KEY, JSON.stringify(list))
    localStorage.setItem('tradingViewIntervalSet', 'true')
  } else {
    list = JSON.parse(stored)

    const has1S = list.includes('1S')
    const shouldHave1S = isSupportSecChains

    if (shouldHave1S && !has1S) {
      list.unshift('1S')
      localStorage.setItem(QUICK_KEY, JSON.stringify(list))
    } else if (!shouldHave1S && has1S) {
      list = list.filter(i => i !== '1S')
      localStorage.setItem(QUICK_KEY, JSON.stringify(list))
    }
  }

  if (!list.includes(currentResolution)) {
    const fallback = '15'
    localStorage.setItem(RESOLUTION_KEY, fallback)
    return fallback
  }

  return currentResolution
}

export function updateChartBackground(): void {
  const key = 'tradingview.chartproperties'
  const stored = localStorage.getItem(key)

  if (!stored) return

  try {
    const properties = JSON.parse(stored)
    const background = useThemeStore().theme === 'light' ? '#fff' : '#0A0B0D'

    const changed =
      properties.paneProperties?.background !== background ||
      properties.paneProperties?.backgroundType !== 'solid'

    if (changed) {
      properties.paneProperties = {
        ...properties.paneProperties,
        background,
        backgroundType: 'solid',
      }
      localStorage.setItem(key, JSON.stringify(properties))
    }
  } catch (e) {
    console.warn(`[updateChartBackground] Invalid JSON in ${key}:`, e)
  }
}


export function buildOrUpdateLastBarFromTx(
  tx: WSTx,
  tokenAddress: string,
  lastBar: KLineBar | null,
  intervalInSeconds: number | string
): KLineBar | null {
  const address = tokenAddress.toLowerCase()
  const txTimeMs = tx.time * 1000

  let price: number, volume: number
  if (tx.from_address.toLowerCase() === address) {
    price = parseFloat(tx.from_price_usd)
    volume = parseFloat(tx.amount_usd)
  } else if (tx.to_address.toLowerCase() === address) {
    price = parseFloat(tx.to_price_usd)
    volume = parseFloat(tx.amount_usd)
  } else {
    return null // 与该 token 无关
  }
  const interval = typeof intervalInSeconds === 'number' ? intervalInSeconds : Number(intervalInSeconds)

  const barStartTime = Math.floor(txTimeMs / (interval * 1000)) * interval * 1000

  // ✅ 时间过滤：必须 >= 当前 bar 的时间段起始时间
  if (lastBar && txTimeMs < lastBar.time) return null

  if (!lastBar) {
    return {
      time: barStartTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume
    }
  }
  if (lastBar.time < barStartTime) {
    return {
      time: barStartTime,
      open: lastBar.close,
      high: Math.max(lastBar.close, price),
      low: Math.min(lastBar.close, price),
      close: price,
      volume
    }
  }

  return {
    ...lastBar,
    high: Math.max(lastBar.high, price),
    low: Math.min(lastBar.low, price),
    close: price,
    volume: lastBar.volume + volume
  }
}

export function waitForTradingView (): Promise<ChartingLibraryWidgetConstructor> {
  return new Promise((resolve) => {
    if (window?.TradingView?.widget) return resolve(window.TradingView.widget)
    // 监听插件派发的事件
    window.addEventListener('tradingview:ready', () => {
      resolve(window.TradingView.widget)
    })
  })
}

export function useWidgetVisibilityRefresh(getWidget: () => IChartingLibraryWidget | null) {
  const documentVisible = useDocumentVisibility()
  const lastHiddenTime = ref<number | null>(null)
  const REFRESH_THRESHOLD = 5 * 60 * 1000 // 10 分钟

  watch(documentVisible, (val) => {
    if (val === 'hidden') {
      lastHiddenTime.value = Date.now()
    }

    if (val === 'visible') {
      const now = Date.now()
      const duration = now - (lastHiddenTime.value || 0)
      const _widget = getWidget()
      if (duration > REFRESH_THRESHOLD && _widget) {
        _widget?.resetCache?.()
        _widget?.activeChart?.().resetData?.()
      }
    }
  })
}

export function useLimitPriceLine(getWidget: () => IChartingLibraryWidget | null, getIsReady: () => boolean) {
  let priceLimitLineId = '' as EntityId
  let isCreating = false
  // 创建 限价价格线
  async function createLimitPriceLine(price: number) {
    const _widget = getWidget()
    const chart = _widget?.activeChart?.()
    if (!_widget || !chart) return
    if (priceLimitLineId) {
      const line = chart?.getShapeById?.(priceLimitLineId)
      if (line) {
        if (!price) {
          chart?.removeEntity?.(priceLimitLineId)
          priceLimitLineId = '' as EntityId
          return
        }
        line?.setPoints?.([{ price: price, time: 0 }])
        return
      }
    }
    if (isCreating) return
    isCreating = true
    priceLimitLineId = await chart?.createShape?.(
      { price: price, time: 0 }, // 水平线的起始位置
      {
        shape: 'horizontal_line',
        lock: true,
        disableSelection: true,
        disableSave: true,
        text: '挂单价格',
        overrides: {
          linecolor: '#FFBE3C',  // 线的颜色
          linewidth: 1,          // 线的粗细
          linestyle: 2        // 线的样式：0表示实线，1表示虚线 2 长虚线
        }
      }
    )
    isCreating = false
    chart?.getShapeById?.(priceLimitLineId)?.setProperties?.({
      textcolor: '#FFBE3C',
      showLabel: true,
      horzLabelsAlign: 'right',
      vertLabelsAlign: 'middle',
      bold: true,
      fontSize: 14,
      // italic: true,
    })
  }



  const botSwapStore = useBotSwapStore()
  const stop = watch(() => botSwapStore.priceLimit, (val) => {
    const isReady = getIsReady()
    if (isReady) {
      createLimitPriceLine(val)
    }
  })

  onUnmounted(() => {
    if (stop) {
      stop()
    }
  })

  return {
    resetLimitPriceLineId: () => {
      priceLimitLineId = '' as EntityId
    }
  }
}

