<template>
  <div>
    <el-table
      :data="txHistory"
      v-if="false"
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
      <el-table-column :label="$t('createdTime')" align="right">
        <template #header>
          <div class="flex-end">
            <span>{{ $t('createdTime') }}</span>
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
      <el-table-column :label="$t('status')" align="right" :min-width="85" show-overflow-tooltip>
        <template #header>
          <span>{{ $t('status') }}</span>
        </template>
        <template #default="{ row }">
          <span v-if="row.status === 'confirmed'" style="color: var(--custom-text-2-color);">{{ $t('completed') }}</span>
          <span v-else-if="row.status === 'error'" style="color: var(--custom-text-2-color);word-break: break-all;">{{ $t('failed') }}<template v-if="row?.errorLog">({{ $f.formatBotError(row?.errorLog) }})</template></span>
          <span v-else-if="row.status === 'cancelled'" style="color: var(--custom-text-2-color);">{{ $t('cancelled1') }}</span>
          <span v-else-if="row.status === 'sent'" style="color: var(--custom-text-2-color);">{{ $t('sent') }}</span>
          <span v-else-if="row.status === 'auto_cancelled'" style="color: var(--custom-text-2-color);word-break: break-all;">{{ $t('autoCancelled') }}<template v-if="row?.errorLog">({{ $f.formatBotError(row?.errorLog) }})</template></span>
          <span v-else-if="row.status === 'waiting'" style="color: var(--custom-text-1-color);">{{ $t('pendingOrder') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('finishTime')" align="right">
        <template #default="{ row }">
          {{ row.blockTime ? $f.formatDate(row.blockTime, 'MM-DD HH:mm:ss') : '--' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('operate')" align="right">
        <template #header>
          <span>{{ $t('operate') }}</span>
        </template>
        <template #default="{ row }">
          <el-button v-if="row.status === 'waiting'" :loading="!!loadingCancel[row.batchId]" size="small" :color="$store.state.mode !== 'dark' ? '#222222' : '#f5f5f5'"  @click.stop="handleCancelOrder(row)">{{ $t('cancel') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operation')" align="right">
        <template #header>
          <span>{{ $t('operation') }}</span>
        </template>
        <template #default="{ row }">
          <i v-if="row.status == 'confirmed' && !row?.isBuy && row.chain === 'solana'" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" class="iconfont icon-fenxiangtubiao ml-5 clickable" @click.stop="openDialog(row)"></i>
          <i v-if="row.txHash" class="iconfont icon-qukuailianliulanqi-baitian font-12  ml_10" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" @click.stop.prevent="jumpExplorerUrl(row)"></i>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      class="dialog-share"
      v-model="dialogVisible"
      :title="$t('share')"
      width="700"
      append-to-body
    >
      <div class="content">
        <div class="share-card" :style="{background: shareItem?.profitRate > 0 ? 'linear-gradient(146.57deg, #003A29 0.8%, #000000 98.72%)' : 'linear-gradient(145.74deg, #49000A 0.79%, #000000 100%)'}">
          <img class="share-bg-img" :src="bgImg" alt="" srcset="">
          <div style="display: inline-block">
            <div class="flex" style="flex-direction: column">
              <div class="flex-start">
                <img src="@/assets/images/avedex_mobile_logo.png" style="height: 24px;" height="24" alt="" srcset="">
                <span class="ml-5 text-20px">Ave.ai</span>
              </div>
              <span class="mt_5 block" style="margin-left: auto;font-size: 10px;color: #fff;max-width: 180px; text-align: center">{{ $t('campaignTitle') }}</span>
            </div>
          </div>
          <div class="flex-start mt-40">
            <div class="icon-token-container share" style="margin-right: 10px">
              <el-image class="token-icon token-logo" :src="$f.formatIcon({logo_url:  !shareItem.isBuy? shareItem?.inTokenLogoUrl : shareItem.outTokenLogoUrl, chain: shareItem.chain}, !shareItem.isBuy ? shareItem?.inTokenSymbol : row.outTokenSymbol)">
                <template #error>
                  <img class="token-icon" :src="$f.formatDefaultIcon(shareItem?.chain, !shareItem.isBuy ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol)" alt="" srcset="">
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="$f.formatDefaultIcon(shareItem?.chain, !shareItem.isBuy ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol)" alt="" srcset="">
                </template>
              </el-image>

              <img
                v-if="shareItem?.chain"
                class="icon-svg icon-symbol chain-logo"
                :src="logoChainBase64 || `${$store.state.s3BaseUrl}chain/${shareItem.chain}.png`"
                alt=""
                onerror="this.src='/icon-default.png'"
                srcset=""
              />
            </div>
            <span class="text-20px">{{ !shareItem.isBuy ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol }}</span>
          </div>
          <span class="mt_5 color-666 block">
            {{ this.$store.state.bot?.userInfo?.evmAddress?.slice(0,6) + '...' + this.$store.state.bot?.userInfo?.evmAddress?.slice(-6)}}
          </span>
          <div class="mt_15">
            <span class="color-999">{{ $t('RIO') }}</span>
            <div class="mt_5" style="font-size: 40px; font-weight: 700;" v-if="shareItem?.profitRate" :style="{ color: shareItem?.profitRate > 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">{{ shareItem?.profitRate > 0 ? '+' : '' }}{{ $f.formatNumberS(shareItem?.profitRate || 0) }}%</div>
            <div class="mt_5" style="font-size: 40px; font-weight: 700;" v-else :style="{ color: '#999' }">--</div>
          </div>
          <table class="mt-20 share-table">
            <tbody>
            <tr>
              <td :style="{width: ($f.getTextWidth($t('campaignBuyAvg')) + 20 + 'px')}">{{ $t('campaignBuyAvg') }}</td>
              <td>
                <template v-if="shareItem?.avg_buy_price > 0">
                  ${{ $f.formatNumber2(shareItem?.avg_buy_price || 0) }}
                </template>
                <span v-else :style="{ color: '#999' }">--</span>
              </td>
            </tr>
            <tr>
              <td :style="{width: ($f.getTextWidth($t('campaignSellAvg')) + 20 + 'px')}">{{ $t('campaignSellAvg') }}</td>
              <td>
                <template v-if="shareItem?.avg_sell_price > 0">
                  ${{ $f.formatNumber2(shareItem?.avg_sell_price || 0) }}
                </template>
                <span v-else :style="{ color: '#999' }">--</span>
              </td>
            </tr>
            <tr>
              <td :style="{width: ($f.getTextWidth($t('campaignBuyTime')) + 20 + 'px')}">{{ $t('campaignBuyTime') }}</td>
              <td>
                <template v-if="shareItem?.last_buy_time">
                  {{ $f.formatDate(shareItem.last_buy_time/1000, 'YYYY-MM-DD HH:mm:ss') }}
                </template>
                <span v-else :style="{ color: '#999' }">--</span>
              </td>
            </tr>
            <tr>
              <td :style="{width: ($f.getTextWidth($t('campaignSellTime')) + 20 + 'px')}">{{ $t('campaignSellTime') }}</td>
              <td>
                <template v-if="shareItem?.last_sell_time">
                  {{ $f.formatDate(shareItem.last_sell_time/1000, 'YYYY-MM-DD HH:mm:ss') }}
                </template>
                <span v-else :style="{ color: '#999' }">--</span>
              </td>
            </tr>
          </tbody>
          </table>
          <div class="invite">
            <div class="tr mt_10">
              <span class="font-20 font_weight_700 block">{{ $t('campaignSubTitle') }}</span>
              <span class="font-12 font_weight_400 mt_10">{{ $t('campaignDesc') }}</span>
            </div>
            <div class="ml_10">
              <img :src="qrcodeUrl" :alt="$t('campaignScan')" width="60px" height="60px">
              <span class="font-14 font_weight_400 mt_5 block">{{ $t('campaignScan') }}</span>
            </div>
          </div>
        </div>

        <!-- <el-button style="width: 630px; margin-top: 20px" native-type="button" color="#333333" icon="DocumentCopy" size="large" @click.stop="copyImage" :loading="loadingCopy">{{ $t('copyImage') }}</el-button> -->
        <div class="flex mt-20 text-12px" style="width: 300px; color: #999;">
          <div class="flex-col flex-center clickable" @click.stop="downloadSharePoster">
            <img src="@/assets/images/share/download.svg" height="48" alt="" srcset="">
            <span class="mt-8">{{ $t('download') }}</span>
          </div>
          <!-- <div class="flex-col flex-center clickable" @click.stop="copyImage">
            <img src="@/assets/images/share/copy.svg" height="48" alt="" srcset="">
            <span class="mt-8">{{ $t('copy') }}</span>
          </div> -->
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpX()">
            <img src="@/assets/images/share/twitter.svg" height="48" alt="" srcset="">
            <span class="mt-8">Twitter</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpTg()">
            <img src="@/assets/images/share/tg.svg" height="48" alt="" srcset="">
            <span class="mt-8">Telegram</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { useStorage } from '@vueuse/core'
// import { utils } from 'ethers'
import { evm_utils as utils } from '@/utils/utils.js'
import { CountDown } from 'vant'
import BigNumber from 'bignumber.js'
import html2canvas from 'html2canvas'
import up1 from '@/assets/images/pc_share/up_1.webp'
import down1 from '@/assets/images/pc_share/down_1.webp'
import { getCampaignToken } from '@/api'
import QRCode from 'qrcode'
// 获取1-5的随机值
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
// operate
let defaultVersion = 1
let Timer = null
export default {
  name: 'BotLimitMy',
  props: {
    // isShowDate: Boolean,
    botOrderOnlyCurrentToken: Boolean,
    txHistoryObj: Object,
  },
  emits: ['update:isShowDate'],
  components: {
    'van-count-down': CountDown,
  },
  setup() {
    let isShowDate = useStorage('bot_limit_my_date_isShow', true, localStorage)
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
    let botOrderFilter = useStorage('bot_order_my_filter', defaultFilter, localStorage)
    if (botOrderFilter?.value?.version !== defaultVersion) {
      botOrderFilter.value = defaultFilter
    }
    return { filterConditions: botOrderFilter, isShowDate}
  },
  data() {
    let range = this.filterConditions?.volume?.range || [0, 100000]
    if (range[1] === 0) {
      range[1] = 100000
    }
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
      let key = botOrderOnlyCurrentToken ? ('my_' + token) : 'my'
      return (this.txHistoryObj?.[key] || [])?.filter(i => filterType?.includes?.(i?.swapType === 5 ? 'buy' : 'sell') && (botOrderOnlyCurrentToken ? (i?.inTokenAddress === token || i?.outTokenAddress === token) : true))
    },
    orderTabActive() {
      return this.$store.state.bot.orderTabActive
    },
    // 自定义排序的地址列表，确保 Solana 在第一位，BSC 在第二位
    sortedAddresses() {
      const addresses = this.$store.state.bot?.userInfo?.addresses || []
      return [...addresses].sort((a, b) => {
        if (a.chain === 'solana') return -1
        if (b.chain === 'solana') return 1
        if (a.chain === 'bsc') return -1
        if (b.chain === 'bsc') return 1
        return 0
      })
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
        setTimeout(() => {
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
      if (batchId) {
        let time = Date.now()
        this.getUserPendingTx().then(() => {
          this.getUserPendingTx_poll(time)
        })
      }
    }
  },
  created() {
    this.getUserPendingTx()
  },
  methods: {
    formatUnits: utils.formatUnits,
    getUserPendingTx_poll(time) {
      Timer = setTimeout(() => {
        this.getUserPendingTx().finally(() => {
          if (Date.now() < time + 30000) {
            this.getUserPendingTx_poll(time)
          } else {
            clearTimeout(Timer)
            Timer = null
          }
        })
      }, 5000)
    },
    getUserPendingTx() {
      let chain = this.$store.state.tokenInfo?.chain
      let orderTabActive = this.$store.state.bot.orderTabActive
      if (orderTabActive === 'my') {
        chain = this.$store.state.bot.isSupportChains?.includes?.(chain) ? chain : ''
        if (!chain) {
          return
        }
      } else {
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
      const walletAddress = this.sortedAddresses.find?.(addr => addr.chain === chain)?.address || ''
      let data = {
        chain,
        token: this.botOrderOnlyCurrentToken ? token : '',
        walletAddress: walletAddress
      }
      this.loading = true
      return this.$store.dispatch('bot_getUserPendingTxWeb', data).then(async res => {
        let key = data.token ? ('my_' + data.token) : 'my'
        // eslint-disable-next-line vue/no-mutating-props
        this.txHistoryObj[key] = res?.map(i => {
          let time = new Date(i.createTime).getTime() / 1000
          // let time = i?.blockTime || Number(new BigNumber(i?.batchId || 0).div(1000).toFixed(0))
          return {
            ...i,
            time
          }
        })
        return res
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
    tableRowClick (row) {
      let token = !row.isBuy? row?.inTokenAddress : row.outTokenAddress
      if (!token) {
        return
      }
      this.$router.push({ name: 'Token', params: { id: token + '-' + row.chain } })
    },
    jumpExplorerUrl(row){
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
            this.getUserPendingTx().finally(() => {
              this.loadingCancel[row.batchId] = false
            })
          } else {
            this.loadingCancel[row.batchId] = false
          }
        }).catch(err => {
          this.loadingCancel[row.batchId] = false
          this.$f.handleBotError(err || 'swap error')
        })
      }).catch(() => {})
    },
    getCampaignToken (token) {
      let data = {
        token: token,
        // acc: this.$store.state.aToken
        acc: this.$store.state?.bot?.userInfo?.addresses?.find?.(i => i?.chain === this.shareItem.chain)?.address
      }
      getCampaignToken(data).then(res => {
        this.shareItem = {
          ...this.shareItem,
          ...res,
          profitRate: res?.profit_realized_ratio,
          last_buy_time:
          res?.last_buy_time !== '1970-01-01T00:00:00Z' &&
          res?.last_buy_time !== '0001-01-01T00:00:00Z' &&
          res?.last_buy_time !== '1970-01-01 00:00:00' &&
          res?.last_buy_time !== '0001-01-01 00:00:00'
            ? new Date(res?.last_buy_time).getTime()
              : 0,
          last_sell_time:
          res?.last_sell_time !== '1970-01-01T00:00:00Z' &&
          res?.last_sell_time !== '0001-01-01T00:00:00Z' &&
          res?.last_sell_time !== '1970-01-01 00:00:00' &&
          res?.last_sell_time !== '0001-01-01 00:00:00'
            ? new Date(res?.last_sell_time).getTime()
              : 0,
        }
        this.getRandomBg(res?.profit_realized_ratio > 0)
        setTimeout(() => {
          this.getShareImg()
        }, 100)
      }).catch(err => {
        console.log('--err--',err)
      })
    },
    openDialog (item) {
      this.loadingCopy = false
      this.dialogVisible = true
      this.shareItem = item
      this.getQRCode()
      this.getRandomBg(false)
      this.getCampaignToken(!item.isBuy? item?.inTokenAddress : item.outTokenAddress)
    },
    downloadFile(blob, filename) {
      let url = ''
      if (typeof blob === 'string') {
        url = blob
      } else {
        url = URL.createObjectURL(blob)
      }
      let a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click();
      window.URL.revokeObjectURL(url)
    },
    downloadSharePoster() {
      let postersDom = document.querySelector('.share-card')
      if (postersDom ) {
        html2canvas(postersDom, {
          backgroundColor: null,
          scale: 3,
          allowTaint: true,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
        }).then(canvas => {
          let dataURL = canvas.toDataURL('image/png')
          this.downloadFile(dataURL, `ave-${this.shareItem?.symbol}-${Date.now()}.png`)
        })
      }
    },
    getShareImg() {
      let postersDom = document.querySelector('.share-card')
      if (postersDom ) {
        return html2canvas(postersDom, {
          backgroundColor: null,
          scale: 3,
          allowTaint: true,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          height: postersDom.clientHeight - 1
        }).then(canvas => {
          this.shareImgCanvas = canvas
          return canvas
        })
      }
    },
    copyImage() {
      if (this.shareImgCanvas) {
        this.loadingCopy = true
        this.shareImgCanvas.toBlob(async (blob) => {
          const item = new window.ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            this.$message.success(this.$t('copySuccess'))
          }).catch(() => {
            // this.$message.error(this.$t('copyFail'))
          }).finally(() => {
            this.loadingCopy = false
          })
        }, 'image/png')
      } else {
        this.loadingCopy = true
        this.getShareImg().then((canvas) => {
          try {
            canvas.toBlob(async (blob) => {
              const item = new window.ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]).then(() => {
                this.$message.success(this.$t('copySuccess'))
              }).catch(() => {
                // this.$message.error(this.$t('copyFail'))
              }).finally(() => {
                this.loadingCopy = false
              })
            }, 'image/png')
          } catch (error) {
            console.log(error)
            this.loadingCopy = false
          }
        })
      }
    },
    // 随机获取背景图片
    getRandomBg(isUp = false) {
      let imgs = isUp ? this.upImg : this.downImg
      let len = imgs.length
      let index = getRandom(1, len)
      this.bgImg = imgs?.[index] || (isUp ? up1 : down1)
    },
    getQRCode() {
      let inviterUrl = this.$store.state.globalConfig.inviter_url_v2 || 'https://share.ave.ai'
      let refCode = this.$store.state.bot.referralInfo.refCode || ''
      let refCodeParams = refCode? '&code=' + refCode : ''
      let shareLink = inviterUrl + '?lang=' + this.$store.getters.language + refCodeParams
      QRCode.toDataURL(shareLink, { margin: 1 })
        .then(url => {
          this.qrcodeUrl= url
        })
        .catch(err => {
          console.error(err)
        })
    },
  }

}
</script>
<style>
.el-popper {
  max-width: 400px;
}
</style>
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
