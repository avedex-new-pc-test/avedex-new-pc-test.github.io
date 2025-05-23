<template>
  <div>
    <el-table
      :data="txHistory"
      fit
      stripe
      max-height="500"
      v-loading="loading && !txHistory?.length"
      style="width: 100%; min-height: 250px;" @row-click="tableRowClick">
      <template #empty>
        <div class="table-empty" v-if="!loading">
          <img
            :src="
              $store.state.mode === 'light'
                ? require('@/assets/images/empty-white.svg')
                : require('@/assets/images/empty-black.svg')
            "
          />
          <span>{{ $t('emptyNoData') }}</span>
        </div>
        <span v-else></span>
      </template>
      <el-table-column :label="$t('token')" align="left">
        <template #default="{ row }">
          <div class="flex-start">
            <div class="icon-token-container" style="margin-right: 5px">
              <el-image class="token-icon" :src="$f.formatIcon({logo_url:  !row?.isBuy ? row?.inTokenLogoUrl : row.outTokenLogoUrl, chain: row.chain}, !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol)">
                <template #error>
                  <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol)" alt="" srcset="">
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol)" alt="" srcset="">
                </template>
              </el-image>
              <img
                v-if="row?.chain"
                class="icon-svg icon-symbol"
                :src="`${$store.state.s3BaseUrl}chain/${row.chain}.png`"
                alt=""
                onerror="this.src='/icon-default.png'"
                srcset=""
              />
            </div>
            <span class="token-symbol">{{ !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol }}</span>
            <i v-if="row.status === 'waiting' && $store.state.bot.orderTabActive === 'my'" class="iconfont icon-zhiding ml-5 text-12px" style="color: #F0B90A;"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('time')" align="right">
        <template #header>
          <div class="flex-end">
            <span>{{ $t('time') }}</span>
            <i v-show="isShowDate" class="iconfont icon-riqi clickable text-12px ml-3" @click.stop="isShowDate=false"></i>
            <i v-show="!isShowDate" class="iconfont icon-countdown clickable text-12px ml-3" @click.stop="isShowDate=true"></i>
          </div>
        </template>
        <template #default="{ row }">
          <van-count-down v-if="!isShowDate && row?.time && $f.formatTimeFromNow(row?.time, true) < 60" :time="(60 - $f.formatTimeFromNow(row?.time, true)) * 1000" style="--van-count-down-text-color: currentColor;--van-count-down-line-height: 1;--van-count-down-font-size: 13px">
            <template #default="{ total }">
              <template v-if="total > 0">
                {{ Math.floor(($f.formatTimeFromNow(row?.time, true) + 60 * 1000 - total) / 1000) }} {{ $t('ss') }}
              </template>
              <template v-else>
                {{ $dayjs(row.time * 1000).fromNow() }}
              </template>
            </template>
          </van-count-down>
          <span v-else>{{ isShowDate ? $f.formatDate(row.time, 'MM-DD HH:mm:ss') :  $dayjs(row.time * 1000).fromNow() }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('type')" align="right" prop="isBuy" >
        <template #header>
          <span>{{ $t('type') }}</span>
          <el-popover
            placement="bottom"
            popper-class="chains-table-filter"
            title=""
            :width="180"
            trigger="click"
            v-model:visible="filterForm['swapType'].visible"
          >
            <template #reference>
              <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: isActiveFilter('swapType') ? 'var(--custom-primary-color)' : ''}"></i>
            </template>
            <template #default>
              <div class="filter-box" :class="$store.state.mode">
                <div class="text-12px font-400 filter-title">{{ $t('type') }}</div>
                <div class="flex mt-10">
                  <el-checkbox-group v-model="filterForm['swapType'].value" size="small">
                    <el-checkbox v-for="(item, index) in ['buy', 'sell']" :key="index" :label="$t(item)" :value="item" />
                  </el-checkbox-group>
                </div>
                <div class="mt-20 flex">
                  <el-button size="default" style="height: 30px; min-width: 70px;--el-button-font-weight: 400;" :color="$store.state.mode !== 'dark' ? '#f2f2f2' : '#333333'"  @click.stop="handleReset(filterForm['swapType'])">
                    {{ $t('reset') }}
                  </el-button>
                  <el-button size="default" :color="$store.state.mode !== 'dark' ? '#222222' : '#f5f5f5'" style="height: 30px; min-width: 70px;--el-button-font-weight: 400;" @click.stop="handleFilterConfirm(filterForm['swapType'])">
                    {{ $t('confirm') }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          <span class="btn-type" :class="row?.isBuy ? 'btn-buy' : 'btn-sell'" :style="{ color: row?.isBuy ? $store.getters.upColor[3] : $store.getters.downColor[3] }">{{ $t('limit')}}/{{ row?.isBuy ? $t('buy') : $t('sell') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('volume4')" align="right">
        <template #header>
          <span>{{ $t('volume4') }}</span>
          <el-popover
            placement="bottom"
            popper-class="chains-table-filter"
            title=""
            :width="350"
            trigger="click"
            v-model:visible="filterForm['volume'].visible"
          >
            <template #reference>
              <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: isActiveFilter('volume') ? 'var(--custom-primary-color)' : ''}"></i>
            </template>
            <template #default>
              <div class="filter-box" :class="$store.state.mode">
                <div class="text-12px font-400 filter-title">{{ $t('volume4') }}($)</div>
                <div class="flex mt-10">
                  <el-input
                    v-model.trim.number="filterForm['volume'].range[0]"
                    :placeholder="$t('minor')"
                    clearable
                  ></el-input>
                  <span class="ml-10 mr-10">~</span>
                  <el-input
                    v-model.trim.number="filterForm['volume'].range[1]"
                    :placeholder="$t('max1')"
                    clearable
                  ></el-input>
                </div>
                <div class="mt-10 mb-20" style="padding: 0 10px;">
                  <el-slider :style="{ '--el-slider-main-bg-color': 'var(--a-slider-bg-color)'}" v-model="filterForm['volume'].range" range :min="0" size="small" :max="filterForm['volume'].defaultRange[1]" :marks="{ 0: '0', [filterForm['volume'].defaultRange[1]]: $f.formatNumber2(filterForm['volume']?.defaultRange?.[1] || 0, 0, 4, 10 ** 4)}" />
                </div>
                <div class="mt-60 flex">
                  <el-button size="default" style="height: 30px; min-width: 70px; --el-button-font-weight: 400;" :color="$store.state.mode !== 'dark' ? '#f2f2f2' : '#333333'"   @click.stop="handleReset(filterForm['volume'])">
                    {{ $t('reset') }}
                  </el-button>
                  <el-button size="default" :color="$store.state.mode !== 'dark' ? '#222222' : '#f5f5f5'" style="height: 30px; min-width: 70px;--el-button-font-weight: 400;" @click.stop="handleFilterConfirm(filterForm['volume'])">
                    {{ $t('confirm') }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          <span :style="{ color: row?.isBuy ? $store.getters.upColor[3] : $store.getters.downColor[3] }">${{ $f.formatNumberS(Number(row?.inValue) || row?.outValue || 0, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('amount1')" align="right">
        <template #header>
          <span>{{ $t('amount1') }}</span>
        </template>
        <template #default="{ row }">
          <span :style="{ color: row?.isBuy ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
            <template v-if="!row?.isBuy">
              {{ !!Number(row?.inAmount) ? $f.formatNumber2(formatUnits(new BigNumber(row?.inAmount || 0).toFixed(0), row.inTokenDecimals || 0), 4) : '--' }} {{ !!Number(row?.inAmount) ? row?.inTokenSymbol : '' }}
            </template>
            <template v-else>
              {{ !!Number(row?.outputAmount) ? $f.formatNumber2(formatUnits(new BigNumber(row?.outputAmount || 0).toFixed(0), row.outTokenDecimals || 0), 4) : '--'  }} {{ !!Number(row?.outputAmount) ? row?.outTokenSymbol : '' }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('price')" align="right">
        <template #header>
          <span>{{ $t('price') }}</span>
        </template>
        <template #default="{ row }">
          <span :style="{ color: row?.swapType === 5 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">${{ row?.isBuy ? $f.formatNumber2(row.status === 'waiting' ? row?.outPriceLimit || row?.outPrice || 0 : row?.outPrice || 0 ) : $f.formatNumber2(row.status === 'waiting' ? row?.outPriceLimit || row?.inPrice || 0 : row?.inPrice || 0) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('status')" align="right">
        <template #header>
          <span>{{ $t('status') }}</span>
        </template>
        <template #default="{ row }">
          <span v-if="row.status === 'confirmed'" style="color: var(--custom-text-2-color);">{{ $t('completed') }}</span>
          <span v-else-if="row.status === 'error'" style="color: var(--custom-text-2-color);word-break: break-all;">{{ $t('failed') }}<template v-if="row?.errorLog">({{ formatBotError(row?.errorLog) }})</template></span>
          <span v-else-if="row.status === 'cancelled'" style="color: var(--custom-text-2-color);">{{ $t('cancelled1') }}</span>
          <span v-else-if="row.status === 'sent'" style="color: var(--custom-text-2-color);">{{ $t('sent') }}</span>
          <span v-else-if="row.status === 'waiting'" style="color: var(--custom-text-1-color);">{{ $t('pendingOrder') }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { useStorage } from '@vueuse/core'
// import { utils } from 'ethers'
import { CountDown } from 'vant'
import BigNumber from 'bignumber.js'
import { evm_utils as utils } from '@/utils/utils.js'
// operate
let defaultVersion = 1
export default {
  name: 'BotLimitMarket',
  props: {
    // isShowDate: Boolean,
    botOrderOnlyCurrentToken: Boolean,
    txHistoryObj: Object,
  },
  components: {
    'van-count-down': CountDown,
  },
  setup() {
    let isShowDate = useStorage('bot_limit_market_date_isShow', true, localStorage)
    let defaultFilter = {
      volume: {
        type: 'volume',
        range: [0, 100000],
      },
      swapType: {
        type: 'swapType',
        value: ['buy', 'sell']
      },
      version: defaultVersion
    }
    let botOrderFilter = useStorage('bot_order_market_filter', defaultFilter, localStorage)
    if (botOrderFilter?.value?.version !== defaultVersion) {
      botOrderFilter.value = defaultFilter
    }
    return { filterConditions: botOrderFilter, isShowDate }
  },
  data() {
    let range = this.filterConditions?.volume?.range || [0, 100000]
    if (range[1] === 0) {
      range[1] = 100000
    }
    console.log('range', range)
    return {
      BigNumber,
      page: 0,
      pageSize: 50,
      // txHistoryObj: {},
      typeFilter: {
        visible: false,
        value: ['buy', 'sell']
      },
      loading: false,
      filterForm: {
        volume: {
          type: 'volume',
          visible: false,
          range: range,
          defaultRange: [0, 100000],
        },
        swapType: {
          type: 'swapType',
          visible: false,
          value: this.filterConditions?.swapType?.value || ['buy', 'sell'],
          defaultValue: ['buy', 'sell']
        }
      },
      loadingCancel: {

      },
      dialogVisible: false,
      shareItem: {},
      logoTokenBase64: '',
      logoChainBase64: '',
      shareImgCanvas: '',
      loadingCopy: false,
      bgImg: '',
      qrcodeUrl: ''
    }
  },
  computed: {
    txHistory() {
      let filterType = this.filterConditions?.swapType?.value || ['buy', 'sell']
      let botOrderOnlyCurrentToken = this.botOrderOnlyCurrentToken
      let token = this.$store.state?.tokenInfo?.address || this.token?.address || ''
      // let orderTabActive = 'market'
      let key = botOrderOnlyCurrentToken ? ('market_' + token) : 'market'
      return (this.txHistoryObj?.[key] || [])?.filter(i => filterType?.includes?.(i?.isBuy ? 'buy' : 'sell') && (botOrderOnlyCurrentToken ? (i?.inTokenAddress === token || i?.outTokenAddress === token) : true))
    },
    orderTabActive() {
      return this.$store.state.bot.orderTabActive
    },
    upImg() {
      let globalConfig = this.$store.state.globalConfig
      let shareImg = globalConfig?.pc_share_image?.replace(/^.*\|/, '')
      return shareImg.split(',').map(img => {
        return globalConfig?.token_logo_url + 'pc_share/' + img
      })
    },
    downImg() {
      let globalConfig = this.$store.state.globalConfig
      let shareImg = globalConfig?.pc_share_image?.replace(/\|.*$/, '')
      return shareImg?.split(',')?.map?.(img => {
        return globalConfig?.token_logo_url + 'pc_share/' + img
      })
    },
  },
  watch: {
    '$store.state.bot.limitHistoryUpdate'(val) {
      if (val) {
        setTimeout(() =>{
          this.page = 0
          this.getUserPendingTx()
        }, 1000)
      }
    },
    '$store.state.bot.orderTabActive'(val) {
      if (val) {
        console.log('orderTabActive', val)
        this.page = 0
        this.getUserPendingTx()
      }
    },
    botOrderOnlyCurrentToken() {
      this.page = 0
      this.getUserPendingTx()
    },
    '$store.state.tokenInfo.chain'(val) {
      if (val) {
        this.page = 0
        this.getUserPendingTx()
      }
    },
    '$store.state.bot.userInfo.evmAddress'(val) {
      if (val) {
        this.page = 0
        this.getUserPendingTx()
      }
    },
    '$store.state.bot.subscribeResult'(val) {
      let batchId = val.batchId
      if (batchId && this.txHistory?.some(i => i.batchId == batchId)) {
        this.getUserPendingTx()
      }
    }
  },
  created() {
    this.getUserPendingTx()
  },
  methods: {
    formatUnits: utils.formatUnits,
    getUserPendingTx() {
      let chain = this.$store.state.tokenInfo?.chain
      let orderTabActive = this.$store.state.bot.orderTabActive
      if (orderTabActive === 'my') {
        return
      }
      let swapTypeList = this.filterConditions?.swapType.value
      let swapTypeBuy = swapTypeList?.includes?.('buy')
      let swapTypeSell = swapTypeList?.includes?.('sell')
      let swapType = (swapTypeBuy && swapTypeSell) ? 0 : ((swapTypeBuy && !swapTypeSell) ? 5 : 6)
      let token = this.$store.state?.tokenInfo?.address || this.token?.address || ''
      let range = this.filterConditions?.volume?.range?.slice?.(0) || [0, 0]
      if (range[0] > range[1]) {
        range = [range[1], range[0]]
      }
      if (range[1] === 100000) {
        range[1] = 0
      }
      let data = {
        page: this.page,
        pageSize: this.pageSize,
        // isLimit: this. isLimit,
        chain: chain,
        token: this.botOrderOnlyCurrentToken ? token : '',
        timeSort: true,
        tradeVolumeSort: false,
        swapType: swapType,
        minTradeVolume: range?.[0] || 0,
        maxTradeVolume: range?.[1] || 0
      }
      this.loading = true
      this.$store.dispatch('bot_getMarketCompletedLimitTx', data).then(res => {
        let key = data.token ? ('market_' + data.token) : 'market'
        // eslint-disable-next-line vue/no-mutating-props
        this.txHistoryObj[key] = res?.map(i => {
          let time = i?.blockTime || Number(new BigNumber(i?.batchId || 0).div(1000).toFixed(0))
          return {
            ...i,
            time
          }
        })

      }).finally(() => {
        this.loading = false
      })
    },
    formatBotError(err) {
      let log = this.$f.formatBotError(err)
      if (log?.length > 70) {
        return log?.slice(0, 60) + '...'
      }
      return log
    },
    filterHandler(value, row, column) {
      const property = column['property']
      console.log('------filterHandler----------', value, row, property)
      return row[property] === value
    },
    isActiveFilterType() {
      let defaultValue = ['buy', 'sell']
      let value = this.typeFilter.value
      return defaultValue.every(v => value.includes(v))
    },
    tableRowClick(row) {
      if (!row.txHash) {
        return
      }
      window.open(this.$f.formatExplorerUrl(row.chain, row.txHash, 'tx'))
    },
    isActiveFilter(prop) {
      if (!prop) return false
      if (prop === 'volume') {
        let defaultRange = [0, 100000]
        let {range} = this.filterConditions?.[prop] || {}
        return !(range?.[0] === defaultRange?.[0] && (range?.[1] === defaultRange?.[1] || range?.[1] === 0))
      } else if (prop === 'swapType') {
        let defaultValue = ['buy', 'sell']
        let value = this.filterConditions?.[prop]?.value || []
        return !(defaultValue.every(v => value.includes(v)))
      }
    },
    handleFilterConfirm(val) {
      if (val.type === 'volume') {
        // let defaultRange = [0, 100000]
        this.filterConditions[val.type].range[0] = val.range[0] || 0
        this.filterConditions[val.type].range[1] = val.range[1] || 0
        console.log('filterConditions', this.filterConditions)
      } else if (val.type === 'swapType') {
        this.filterConditions[val.type].value = val.value || []
      }
      val.visible = false
      this.page = 0
      this.getUserPendingTx()
    },
    handleReset(val) {
      if (val.type === 'volume') {
        val.range = [0, 100000]
      } else if (val.type === 'swapType') {
        val.value = ['buy', 'sell']
      }
      this.handleFilterConfirm(val)
    },
    handleCancelOrder(row) {
      this.$confirm(this.$t('botCancelOrder'), '', {
        confirmButtonText: this.$t('confirm1'),
        cancelButtonText: this.$t('cancel')
      })
      .then(() => {
        this.loadingCancel[row.batchId] = true
        this.$store.dispatch('bot_cancelLimitOrdersByBatch', {chain: row.chain, batchId: row.batchId}).then(res => {
          console.log('cancelLimitOrdersByBatch', res)
          if (res) {
            this.getUserPendingTx()
          }
        }).catch(err => {
          this.$f.handleBotError(err || 'swap error')
        }).finally(() => {
          this.loadingCancel[row.batchId] = false
        })
      }).catch(() => {})
    },
  }

}
</script>
<style lang="scss" scoped>
.bot-swap-history {
  margin: 0 -10px;
  padding-bottom: 30px;
  .tabs {
    width: fit-content;
    border-radius: 4px;
    border: var(--custom-br);
    // padding: 1px;
    display: flex;
    margin: 5px 10px 10px 10px;
    font-size: 12px;
    .tab-radio-input {
      width: 0;
      height: 0;
      font-size: 0;
      opacity: 0;
      &:checked + .tab-item {
        background: var(--custom-btn-bg-color);
        border-radius: 4px;
        color: var(--custom-text-1-color);
      }
    }
    .tab-item {
      cursor: pointer;
      color: var(--custom-text-2-1-color);
      letter-spacing: 0;
      line-height: 16px;
      font-weight: 500;
      padding: 3px 6px;
      min-width: 60px;
      text-align: center;
    }
  }
  :deep(.el-table) {
    --el-table-tr-bg-color: var(--custom-bg-1-color);
    // --el-bg-color: var(--custom-primary-lighter-0-color);
    --el-table-bg-color: var(--custom-bg-1-color);
    // --el-table-row-hover-bg-color: var(--custom-td-hover-2-color);
    --el-table-text-color: var(--a-text-1-color);
    --el-table-header-bg-color: var(--custom-table-th-bg-color);
    // --el-fill-color-lighter: var(--custom-table-stripe-bg-color);
    --el-fill-color-lighter: var(--custom-bg-1-color);
    --el-table-header-text-color: var(--a-text-2-color);
    --el-table-border-color: var(--custom-br-1-color);
    --el-table-row-hover-bg-color: var(--a-table-hover-bg-color);
    background: var(--custom-bg-1-color);
    --el-bg-color: var(--custom-bg-1-color);
    --el-table-border: 0.5px solid var(--custom-br-1-color);
    font-size: 13px;
    th {
      padding: 6px 0;
      border-bottom: none !important;
      height: 32px;
      &.el-table__cell.is-leaf {
        border-bottom: none;
        &.descending {
          .cell {
            color: var(--custom-primary-color);
            .sort-caret {
              &.descending {
                border-top-color: var(--custom-primary-color);
              }
            }
          }
        }
        &.ascending {
          .cell {
            color: var(--custom-primary-color);
            .sort-caret {
              &.ascending {
                border-bottom-color: var(--custom-primary-color);
              }
            }
          }
        }
      }
      .cell {
        font-weight: 400;
        font-size: 12px;
      }
    }
  }
  .table-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px 0;
    // min-height: 200px;
  }
  .btn-type {
    border-radius: 4px;
    padding: 2px 5px;
    &.btn-buy {
      background: rgba($color: #12B886, $alpha: 0.1);
    }
    &.btn-sell {
      background: rgba($color: #F6465D, $alpha: 0.1);
    }
  }
}
.icon-token-container {
  .token-icon {
    width: 32px;
    height: 32px;
  }
  .icon-symbol {
    width: 12px;
    height: 12px;
    top: 21px;
    left: 21px;
  }
}
.filter-box {
  color: var(--custom-text-1-color);
  .filter-title {
    font-size: 12px;
    color: var(--a-text-2-color);
  }
  --el-font-size-base: 12px;
  :deep() .el-slider {
    --el-slider-runway-bg-color: var(--a-slider-runway-bg-color);
    --el-slider-main-bg-color: var(--a-slider-bg-color);
    .el-slider__button {
      background-color: var(--a-slider-btn-color);
    }
    .el-slider__marks-text {
      font-size: 12px;
    }
  }
  :deep() .el-slider__runway {
    --el-slider-button-size: 14px;
    .el-slider__marks {
      .el-slider__marks-text:nth-child(2) {
        transform: translateX(0) !important;
        right: -6px !important;
        left: auto !important;
      }
    }
  }
  .chain-icon-sort-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
    .icon-svg {
      font-size: 10px;
      padding: 0;
      cursor: pointer;
      color: var(--a-text-2-color);
      width: 12px;
      height: 10px;
      & + .icon-svg {
        margin-top: 1px;
      }
      &.active {
        color: var(--custom-primary-color);
      }
    }
  }
  .icon-filter-sort {
    font-size: 12px;
    opacity: 0.3;
    &.active {
      opacity: 1;
    }
    &:hover:not(.active) {
      opacity: 0.6;
    }
    cursor: pointer;
  }
}
</style>
