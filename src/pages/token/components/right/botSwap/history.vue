<!-- eslint-disable no-empty -->
<template>
  <div class="bot-swap-history">
    <div class="flex" style="padding-right: 15px;" v-if="isBot">
      <div class="tabs">
        <template v-for="(item, index) in tabs" :key="index">
          <input
            type="radio"
            :id="`tab-bot-history-item-${item.chain}`"
            v-model="$store.state.bot.historyTabActive"
            :value="item.chain"
            class="tab-radio-input"
          />
          <label :for="`tab-bot-history-item-${item.chain}`" class="tab-item clickable-btn" v-if="item.chain">
            {{ $f.getChainInfo(item.chain).name }}
          </label>
        </template>
      </div>
      <div class="action-buttons">
        <button 
          class="btn-current-token" 
          :class="{ 'active': botHistoryOnlyCurrentToken }"
          @click="toggleCurrentToken"
        >
          {{ $t('currentToken') }}
        </button>
      </div>
    </div>

    <!-- 顶部交易统计区域 -->
    <div class="transaction-stats">
      <div class="stat-item">
        <div class="stat-label">{{ $t('balance1') }}</div>
        <div class="stat-value table-field-text">${{ $f.formatNumberS(balance, 2) }}</div>
        <div class="stat-change table-field-text" >
          {{ $f.formatNumberS(walletTxData?.balance_amount || 0, 4) }} {{ tokenSymbol }} 
          <span :style="{ color: changePercentage >= 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
            ({{ changePercentage >= 0 ? '+' : '' }}{{ $f.formatNumberS(changePercentage, 2) }}%)
          </span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">{{ $t('totalProfit') }}</div>
        <div class="stat-value table-field-text">${{ $f.formatNumberS(totalProfit, 2) }}</div>
        <div class="stat-change" :style="{ color: profitPercentage >= 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
          {{ profitPercentage >= 0 ? '+' : '' }}{{ $f.formatNumberS(profitPercentage, 2) }}%
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">{{ $t('realizedProfit') }}</div>
        <div class="stat-value table-field-text">${{ $f.formatNumberS(realizedProfit, 2) }}</div>
        <div class="stat-change" :style="{ color: realizedProfitPercentage >= 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
          {{ realizedProfitPercentage >= 0 ? '+' : '' }}{{ $f.formatNumberS(realizedProfitPercentage, 2) }}%
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">{{ $t('unrealizedProfit') }}</div>
        <div class="stat-value table-field-text">${{ $f.formatNumberS(unrealizedProfit, 2) }}</div>
        <div class="stat-change" :style="{ color: unrealizedProfitPercentage >= 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
          {{ unrealizedProfitPercentage >= 0 ? '+' : '' }}{{ $f.formatNumberS(unrealizedProfitPercentage, 2) }}%
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">{{ $t('buyPriceWithSlash') }}</div>
        <div class="stat-value token-amount table-field-text">{{ buyTokenAmount }} {{ tokenSymbol }}</div>
        <div class="stat-change table-field-text">{{ buyUsdAmount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">{{ $t('sellPriceWithSlash') }}</div>
        <div class="stat-value token-amount table-field-text">{{ sellTokenAmount }} {{ tokenSymbol }}</div>
        <div class="stat-change table-field-text">{{ sellUsdAmount }}</div>
      </div>
    </div>

    <!-- 新表格 (参照unified样式) -->
    <div class="new-table-wrapper" v-if="isBot">
      <el-table
        :data="txHistory"
        fit
        stripe
        max-height="700"
        v-loading="loading && !txHistory?.length"
        style="width: 100%; min-height: 250px;" 
        @row-click="tableRowClick">
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
                <el-image class="token-icon" :src="$f.formatIcon({logo_url:  row.swapType === 2|| row.swapType === 6 ? row?.inTokenLogoUrl : row.outTokenLogoUrl, chain: row.chain}, row.swapType ===  2 || row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol)">
                  <template #error>
                    <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, row.swapType === 2|| row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol)" alt="" srcset="">
                  </template>
                  <template #placeholder>
                    <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, row.swapType === 2|| row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol)" alt="" srcset="">
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
              <span class="token-symbol">{{ row.swapType === 2 || row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol }}</span>
              <!-- <i v-if="row.status !== 'confirmed' && row.status !== 'error'" class="iconfont icon-zhiding ml-5 text-12px" style="color: #F0B90A;"></i> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('type')" align="right" prop="isBuy">
          <template #header>
            <span>{{ $t('type') }}</span>
            <el-dropdown trigger="click" @command="handleTypeCommand">
              <span class="dropdown-link">
                <i class="iconfont icon-guolv1 text-10px ml-3 mt-3 clickable" :style="{color: newFilterForm.isLimit !== null || newFilterForm.swapType.value !== null ? 'var(--custom-primary-color)' : ''}"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all">{{ $t('all') }}</el-dropdown-item>
                  <el-dropdown-item command="LimitSell" :class="{ 'active-dropdown-item': newFilterForm.isLimit === 1 && newFilterForm.swapType.value === 0 }">{{ $t('limit') }}/{{ $t('sell') }}</el-dropdown-item>
                  <el-dropdown-item command="LimitBuy" :class="{ 'active-dropdown-item': newFilterForm.isLimit === 1 && newFilterForm.swapType.value === 1 }">{{ $t('limit') }}/{{ $t('buy') }}</el-dropdown-item>
                  <el-dropdown-item command="MarketSell" :class="{ 'active-dropdown-item': newFilterForm.isLimit === 0 && newFilterForm.swapType.value === 0 }">{{ $t('market') }}/{{ $t('sell') }}</el-dropdown-item>
                  <el-dropdown-item command="MarketBuy" :class="{ 'active-dropdown-item': newFilterForm.isLimit === 0 && newFilterForm.swapType.value === 1 }">{{ $t('market') }}/{{ $t('buy') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template #default="{ row }">
            <span class="btn-type" :style="{ color: (row.swapType === 1 || row.swapType === 5 )? $store.getters.upColor[3] : $store.getters.downColor[3] }">
              <span v-if="row.swapType === 1" class="btn-buy">{{ $t('market') }}/{{ $t('buy') }}</span>
              <span v-else-if="row.swapType === 2" class="btn-sell">{{ $t('market') }}/{{ $t('sell') }}</span>
              <span v-else-if="row.swapType === 5" class="btn-buy">{{ $t('limit') }}/{{ $t('buy') }}</span>
              <span v-else-if="row.swapType === 6" class="btn-sell">{{ $t('limit') }}/{{ $t('sell') }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('price')" align="right">
          <template #header>
            <span>{{ $t('price') }}</span>
          </template>
          <template #default="{ row }">
            <span class="table-field-text">${{ row?.swapType === 1 ? $f.formatNumber2(row?.outPrice || 0) : $f.formatNumber2(row?.inPrice || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('volume4')" align="right">
          <template #header>
            <span>{{ $t('volume4') }}</span>
            <el-popover
              v-if="false"
              placement="bottom"
              popper-class="chains-table-filter"
              title=""
              :width="350"
              trigger="click"
              v-model:visible="newFilterForm['volume'].visible"
            >
              <template #reference>
                <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: isActiveFilterNew('volume') ? 'var(--custom-primary-color)' : ''}"></i>
              </template>
              <template #default>
                <div class="filter-box" :class="$store.state.mode">
                  <div class="text-12px font-400 filter-title">{{ $t('volume4') }}($)</div>
                  <div class="flex mt-10">
                    <el-input
                      v-model.trim.number="newFilterForm['volume'].range[0]"
                      :placeholder="$t('minor')"
                      clearable
                    ></el-input>
                    <span class="ml-10 mr-10">~</span>
                    <el-input
                      v-model.trim.number="newFilterForm['volume'].range[1]"
                      :placeholder="$t('max1')"
                      clearable
                    ></el-input>
                  </div>
                  <div class="mt-10 mb-20" style="padding: 0 10px;">
                    <el-slider :style="{ '--el-slider-main-bg-color': 'var(--a-slider-bg-color)'}" v-model="newFilterForm['volume'].range" range :min="0" size="small" :max="newFilterForm['volume'].defaultRange[1]" :marks="{ 0: '0', [newFilterForm['volume'].defaultRange[1]]: $f.formatNumber2(newFilterForm['volume']?.defaultRange?.[1] || 0, 0, 4, 10 ** 4)}" />
                  </div>
                  <div class="mt-60 flex">
                    <el-button size="default" style="height: 30px; min-width: 70px; --el-button-font-weight: 400;" :color="$store.state.mode !== 'dark' ? '#f2f2f2' : '#333333'"   @click.stop="handleResetNew(newFilterForm['volume'])">
                      {{ $t('reset') }}
                    </el-button>
                    <el-button size="default" :color="$store.state.mode !== 'dark' ? '#222222' : '#f5f5f5'" style="height: 30px; min-width: 70px;--el-button-font-weight: 400;" @click.stop="handleFilterConfirmNew(newFilterForm['volume'])">
                      {{ $t('confirm') }}
                    </el-button>
                  </div>
                </div>
              </template>
            </el-popover>
          </template>
          <template #default="{ row }">
            <span class="table-field-text">${{ $f.formatNumberS(Number(row?.inValue) || row?.outValue || 0, 2) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('amount1')" align="right">
          <template #header>
            <span>{{ $t('amount1') }}</span>
          </template>
          <template #default="{ row }">
            <span class="table-field-text">
              <template v-if="!row?.isBuy">
                {{ $f.formatNumber2(formatUnits(new BigNumber(row?.inAmount || 0).toFixed(0), row.inTokenDecimals || 0), 4) }} {{ row?.inTokenSymbol }}
              </template>
              <template v-else>
                {{ $f.formatNumber2(formatUnits(new BigNumber(row?.outAmount || 0).toFixed(0), row.outTokenDecimals || 0), 4) }} {{ row?.outTokenSymbol }}
              </template>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('status')" align="right" show-overflow-tooltip>
          <template #header>
            <div class="type-header">
              <span>{{ $t('status') }}</span>
              <el-dropdown trigger="click" @command="handleStatusCommand">
                <span class="dropdown-link">
                  <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: newFilterForm.statusType.value ? 'var(--custom-primary-color)' : ''}"></i>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="all">{{ $t('all') }}</el-dropdown-item>
                    <el-dropdown-item command="confirmed" :class="{ 'active-dropdown-item': newFilterForm.statusType.value === 'confirmed' }">{{ $t('completed') }}</el-dropdown-item>
                    <el-dropdown-item command="cancelled" :class="{ 'active-dropdown-item': newFilterForm.statusType.value === 'cancelled' }">{{ $t('cancelled1') }}</el-dropdown-item>
                    <el-dropdown-item command="error" :class="{ 'active-dropdown-item': newFilterForm.statusType.value === 'error' }">{{ $t('failed') }}</el-dropdown-item>
                    <el-dropdown-item command="auto_cancelled" :class="{ 'active-dropdown-item': newFilterForm.statusType.value === 'auto_cancelled' }">{{ $t('autoCancelled') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="{ row }">
            <span v-if="row.status === 'confirmed'" style="color: var(--custom-text-2-color);">{{ $t('completed') }}</span>
            <span v-else-if="row.status === 'error'" style="color: var(--color-red-500);word-break: break-all;">{{ $t('failed') }}<template v-if="row?.errorLog">({{ formatBotError(row?.errorLog) }})</template></span>
            <span v-else-if="row.status === 'cancelled'" style="color: var(--custom-text-2-color);">{{ $t('cancelled1') }}</span>
            <span v-else-if="row.status === 'auto_cancelled'" style="color: var(--custom-text-2-color);">{{ $t('autoCancelled') }}</span>
            <span v-else style="color: var(--custom-text-1-color);">{{ $t('pending') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('CreateTime')" align="right">
          <template #header>
            <div class="flex-end">
              <span>{{ $t('CreateTime') }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <span class="table-field-text">{{ isNewTableShowDate ? $f.formatDate(row.time, 'YYYY/MM/DD HH:mm') : $dayjs(row.time * 1000).fromNow() }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" align="right">
          <template #header>
            <span>{{ $t('operation') }}</span>
          </template>
          <template #default="{ row }">
            <i v-if="row.status == 'confirmed' &&  row.swapType === 2 && row.chain === 'solana'" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" class="iconfont icon-fenxiangtubiao ml-5 clickable" @click.stop="openDialog(row)"></i>
            <i v-if="row.txHash" class="iconfont icon-qukuailianliulanqi-baitian font-14  ml_10" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" @click.stop.prevent="jumpExplorerUrl(row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
              <el-image class="token-icon token-logo" :src="$f.formatIcon({logo_url:  shareItem.swapType === 2 ? shareItem?.inTokenLogoUrl : shareItem.outTokenLogoUrl, chain: shareItem.chain}, shareItem.swapType === 2 ? shareItem?.inTokenSymbol : row.outTokenSymbol)">
                <template #error>
                  <img class="token-icon" :src="$f.formatDefaultIcon(shareItem?.chain, shareItem.swapType === 2 ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol)" alt="" srcset="">
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="$f.formatDefaultIcon(shareItem?.chain, shareItem.swapType === 2 ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol)" alt="" srcset="">
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
            <span class="text-20px">{{ shareItem.swapType === 2 ? shareItem?.inTokenSymbol : shareItem.outTokenSymbol }}</span>
          </div>
          <span class="mt_5 color-666 block">
            {{ $store.state.bot?.userInfo?.evmAddress?.slice(0,6) + '...' + $store.state.bot?.userInfo?.evmAddress?.slice(-6)}}
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

let defaultVersion = 1
export default {
  name: 'BotSwapHistory',
  components: {
    'van-count-down': CountDown,
  },
  setup() {
    let isShowDate = useStorage('bot_history_date_isShow', true, localStorage)
    let botHistoryOnlyCurrentToken = useStorage('bot_history_onlyCurrentToken', true, sessionStorage)
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
    let botHistoryFilter = useStorage('bot_history_filter', defaultFilter, localStorage)
    if (botHistoryFilter?.value?.version !== defaultVersion) {
      botHistoryFilter.value = defaultFilter
    }
    return { isShowDate, botHistoryOnlyCurrentToken, filterConditions: botHistoryFilter }
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
      txHistoryObj: {},
      loading: false,
      walletTxData: null,
      typeFilter: {
        visible: false,
        value: ['buy', 'sell']
      },
      filterForm: {
        volume: {
          type: 'volume',
          visible: false,
          range: this.filterConditions?.volume?.range || [0, 100000],
          defaultRange: [0, 100000],
        },
        swapType: {
          type: 'swapType',
          visible: false,
          value: null  // 0: all, 1: buy, 2: sell
        },
        statusType: {
          type: 'statusType',
          visible: false,
          value: ''
        },
        isLimit: null  // 0: market order, 1: limit order
      },
      dialogVisible: false,
      shareItem: this.txHistory?.[0] || {},
      logoTokenBase64: '',
      logoChainBase64: '',
      shareImgCanvas: '',
      loadingCopy: false,
      bgImg: '',
      qrcodeUrl: '',
      isNewTableShowDate: true,
      newFilterForm: {
        volume: {
          type: 'volume',
          visible: false,
          range: [0, 100000],
          defaultRange: [0, 100000],
        },
        swapType: {
          type: 'swapType',
          visible: false,
          value: null  // 0: all, 1: buy, 2: sell
        },
        statusType: {
          type: 'statusType',
          visible: false,
          value: ''
        },
        isLimit: null  // 0: market order, 1: limit order
      },
      newFilterConditions: {
        volume: {
          type: 'volume',
          range: [0, 100000],
        },
        swapType: {
          type: 'swapType',
          value: ['buy', 'sell']
        },
      },
      pollTimer: null,
      isPollingActive: false
    }
  },
  computed: {
    isBot() {
      return !!this.$store.state.bot?.userInfo?.evmAddress;
    },
    txHistory() {
      let filterType = this.filterConditions?.swapType?.value || ['buy', 'sell']
      let botHistoryOnlyCurrentToken = this.botHistoryOnlyCurrentToken
      let token = this.$store.state?.tokenInfo?.address || this.token?.address || ''
      return (this.txHistoryObj?.[this.$store.state.bot.historyTabActive] || [])?.filter(i => filterType?.includes?.(i?.swapType === 1 ? 'buy' : 'sell') && (botHistoryOnlyCurrentToken ? (i?.inTokenAddress === token || i?.outTokenAddress === token) : true))
    },
    tabs() {
      // 获取原始地址数组
      const addresses = this.$store.state.bot?.userInfo?.addresses || []
      
      // 自定义排序，确保 Solana 在第一位，BSC 在第二位
      return [...addresses].sort((a, b) => {
        if (a.chain === 'solana') return -1  // Solana 排在最前面
        if (b.chain === 'solana') return 1
        if (a.chain === 'bsc') return -1     // BSC 排在 Solana 之后
        if (b.chain === 'bsc') return 1
        return 0  // 其他链保持原来的顺序
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
    // 余额
    balance() {
      return this.walletTxData ? parseFloat(this.walletTxData.balance_usd || 0) : 0;
    },
    
    // 余额变化百分比
    changePercentage() {
      return this.walletTxData ? parseFloat(this.walletTxData.balance_ratio * 100 || 0) : 0;
    },
    
    // 总利润
    totalProfit() {
      return this.walletTxData ? parseFloat(this.walletTxData.total_profit || 0) : 0;
    },
    
    // 总利润百分比
    profitPercentage() {
      return this.walletTxData ? parseFloat(this.walletTxData.total_profit_ratio * 100 || 0) : 0;
    },
    
    // 已实现利润
    realizedProfit() {
      return this.walletTxData ? parseFloat(this.walletTxData.realized_profit || 0) : 0;
    },
    
    // 已实现利润百分比
    realizedProfitPercentage() {
      const ratio = this.walletTxData && this.walletTxData.realized_ratio !== "--" ? 
        parseFloat(this.walletTxData.realized_ratio * 100 || 0) : 0;
      return ratio;
    },
    
    // 未实现利润
    unrealizedProfit() {
      return this.walletTxData ? parseFloat(this.walletTxData.unrealized_profit || 0) : 0;
    },
    
    // 未实现利润百分比
    unrealizedProfitPercentage() {
      return this.walletTxData ? parseFloat(this.walletTxData.unrealized_ratio * 100 || 0) : 0;
    },
    
    // 买入代币数量
    buyTokenAmount() {
      return this.walletTxData && this.walletTxData.total_purchase > 0 ? 
        this.$f.formatNumberS(this.walletTxData.bought || 0, 4) : "0";
    },
    
    // 买入美元金额
    buyUsdAmount() {
      const avgPrice = this.walletTxData ? parseFloat(this.walletTxData.average_purchase_price_usd || 0) : 0;
      const totalPurchase = this.walletTxData ? parseFloat(this.walletTxData.total_purchase_usd || 0) : 0;
      
      return avgPrice > 0 ? 
        // `$${this.$f.formatNumberS(avgPrice, 8)}|$${this.$f.formatNumberS(totalPurchase, 2)}` : 
        `$${this.$f.formatNumberS(avgPrice, 8)}` : 

        "--";
    },
    
    // 卖出代币数量
    sellTokenAmount() {
      return this.walletTxData && this.walletTxData.total_sold > 0 ? 
        this.$f.formatNumberS(this.walletTxData.sold || 0, 4) : "0";
    },
    
    // 卖出美元金额
    sellUsdAmount() {
      const avgPrice = this.walletTxData && this.walletTxData.average_sold_price_usd !== "--" ? 
        parseFloat(this.walletTxData.average_sold_price_usd || 0) : 0;
      const totalSold = this.walletTxData && this.walletTxData.total_sold_usd !== "--" ? 
        parseFloat(this.walletTxData.total_sold_usd || 0) : 0;
      
      return avgPrice > 0 ? 
        // `$${this.$f.formatNumberS(avgPrice, 8)}|$${this.$f.formatNumberS(totalSold, 2)}` : 
        `$${this.$f.formatNumberS(avgPrice, 8)}` :
        "--";
    },
    tokenSymbol() {
      return this.walletTxData ? this.walletTxData.symbol : (this.$store.state?.tokenInfo?.symbol || '');
    }
  },
  watch: {
    '$store.state.bot.historyUpdate'(val) {
      if (val) {
        this.page = 0
        let time = Date.now()
        this.getUserTxHistory().then((res) => {
          let row = res?.[0] || {}
          let price = row?.swapType === 1 ? Number(row?.outPrice || 0) : Number(row?.inPrice || 0)
          if (row?.status === 'confirmed' && !price) {
            // this.getUserTxHistory_poll(time)
          }
        })
        this.getUserWalletTxInfo()
      }
    },
    '$store.state.bot.historyTabActive'(val) {
      if (val) {
        this.page = 0
        console.log('historyTabActive', val)
        this.getUserTxHistory()
        this.getUserWalletTxInfo()
      }
    },
    botHistoryOnlyCurrentToken() {
      this.page = 0
      this.getUserTxHistory()
      this.getUserWalletTxInfo()
    },
    '$store.state.tokenInfo.address'() {
      this.getUserWalletTxInfo();
    },
    '$store.state.tokenInfo.chain'(val) {
      if (val) {
        this.$store.state.bot.historyTabActive = this.$store.state.bot.isSupportChains?.includes?.(val) ? val : 'eth'
      }
    },
    '$store.state.bot.userInfo.evmAddress'(val) {
      if (val) {
        this.page = 0
        this.getUserTxHistory()
        this.getUserWalletTxInfo()
      } else {
        // 当 bot 状态变为 false 时，重置所有统计数据为 0
        this.walletTxData = {
          balance_usd: 0,
          balance_ratio: 0,
          total_profit: 0,
          total_profit_ratio: 0,
          realized_profit: 0,
          realized_ratio: 0,
          unrealized_profit: 0,
          unrealized_ratio: 0,
          bought: 0,
          sold: 0,
          total_purchase: 0,
          total_purchase_usd: 0,
          total_sold: 0,
          total_sold_usd: 0,
          average_purchase_price_usd: 0,
          average_sold_price_usd: 0
        }
        this.txHistoryObj = {}
      }
    },
  },
  mounted() {
    let chain = this.$store.state.tokenInfo?.chain
    this.$store.state.bot.historyTabActive = this.$store.state.bot.isSupportChains?.includes?.(chain) ? chain : 'eth'
    this.getUserTxHistory()
    this.getUserWalletTxInfo(true)
  },
  methods: {
    startPolling() {
      this.stopPolling()
      
      if (this.isPollingActive) {
        return;
      }
      
      this.isPollingActive = true;
      
      this.pollTimer = setInterval(() => {
        this.getUserWalletTxInfo(true)
      }, 5000)
      
      setTimeout(() => {
        this.stopPolling()
      }, 30000)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
        this.isPollingActive = false
      }
    },
    formatUnits: utils.formatUnits,
    getUserWalletTxInfo(isPolling = false) {
      const chain = this.$store.state.bot.historyTabActive;
      const supportedChains = ['solana', 'bsc'];
      
      if (!supportedChains.includes(chain)) {
        console.log('Chain not supported:', chain);
        return;
      }
      
      let userAddress;
      if (this.isBot) {
        userAddress = this.tabs.find(i => i?.chain === chain)?.address;
      } else {
        userAddress = this.$store.state.currentAccount;
      }
      
      const token = this.$store.state.tokenInfo?.address;
      
      if (!userAddress || !token) return;
      
      const params = {
        user_address: userAddress,
        chain: chain,
        user_token: token
      };
      
      
      this.$store.dispatch('bot_getUserWalletTxInfo', params).then(res => {
        const tokenData = res[0];
        
        this.walletTxData = tokenData;
        
        this.$forceUpdate();
        
        if (!isPolling) {
          this.startPolling();
        }
      }).catch(err => {
        console.error('Failed to fetch wallet transaction info:', err);
      });
    },
    getUserTxHistory() {
      let swapTypeList = this.filterConditions?.swapType.value
      console.log('swapTypeList', swapTypeList)
      let swapTypeBuy = swapTypeList?.includes?.('buy')
      let swapTypeSell = swapTypeList?.includes?.('sell')
      let swapType = (swapTypeBuy && swapTypeSell) ? 0 : ((swapTypeBuy && !swapTypeSell) ? 1 : 2)
      
      let walletAddress;
      if (this.isBot) {
        walletAddress = this.tabs.find(i => i?.chain === this.$store.state.bot.historyTabActive)?.address;
      } else {
        walletAddress = this.$store.state.currentAccount;
      }
      
      let data = {
        page: this.page,
        pageSize: this.pageSize,
        chain: this.$store.state.bot.historyTabActive,
        walletAddress: walletAddress,
        token: this.botHistoryOnlyCurrentToken ? this.$store.state.tokenInfo?.address : '',
        timeSort: true,
        tradeVolumeSort: false,
        isSuccess: false,
        status: this.newFilterForm.statusType.value,
        minTradeVolume: this.filterConditions?.volume?.range?.[0] || 0,
        maxTradeVolume: this.filterConditions?.volume?.range?.[1] || 0
      }
      if(this.newFilterForm.isLimit === 0 || this.newFilterForm.isLimit === 1) {
        data.isLimit = this.newFilterForm.isLimit 
      } 

      if(this.newFilterForm.swapType.value === 0 || this.newFilterForm.swapType.value === 1) {
        data.isBuy = this.newFilterForm.swapType.value 
      } 
      
      this.loading = true
      return this.$store.dispatch('bot_getUserTxHistory1', data).then(res => {
        this.txHistoryObj[data.chain] = res?.map(i => {
          // let time = i?.blockTime || Number(new BigNumber(i?.batchId || 0).div(1000).toFixed(0))
          let time = new Date(i.updateTime).getTime() / 1000
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
      let token = row.swapType === 2 || row.swapType === 6 ? row?.inTokenAddress : row.outTokenAddress
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
        let {defaultRange} = this.filterForm[prop]
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
        this.filterConditions[val.type].range[1] = val.range[1] >= val.defaultRange[1] ? 0 : (val.range[1] || 0)
        console.log('filterConditions', this.filterConditions)
      } else if (val.type === 'swapType') {
        this.filterConditions[val.type].value = val.value || []
      }
      val.visible = false
      this.page = 0
      this.getUserTxHistory()
    },
    handleReset(val) {
      if (val.type === 'volume') {
        val.range = [...val.defaultRange]
      } else if (val.type === 'swapType') {
        val.value = ['buy', 'sell']
      }
      this.handleFilterConfirm(val)
    },
    getCampaignToken (token) {
      // 根据是否是Bot模式使用不同的地址
      let userAddress;
      if (this.isBot) {
        userAddress = this.tabs.find?.(i => i?.chain === this.shareItem.chain)?.address;
      } else {
        userAddress = this.$store.state.currentAccount;
      }
      
      let data = {
        token: token,
        acc: userAddress
      };
      
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
      this.getCampaignToken(item.swapType === 2 ? item?.inTokenAddress : item.outTokenAddress)
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
    // 切换当前token按钮
    toggleCurrentToken() {
      this.botHistoryOnlyCurrentToken = !this.botHistoryOnlyCurrentToken;
      this.page = 0;
      this.getUserTxHistory();
    },
    handleTypeCommand(command) {
      if (command === 'all') {
        this.newFilterForm.swapType.value = null;
        this.newFilterForm.isLimit = null; // Reset to show all
      } else if (command === 'LimitSell') {
        // Explicit Limit Sell
        this.newFilterForm.swapType.value = 0;
        this.newFilterForm.isLimit = 1;
      } else if (command === 'LimitBuy') {
        // Explicit Limit Buy
        this.newFilterForm.swapType.value = 1;
        this.newFilterForm.isLimit = 1;
      } else if (command === 'MarketSell') {
        // Explicit Market Sell
        this.newFilterForm.swapType.value = 0;
        this.newFilterForm.isLimit = 0;
      } else if (command === 'MarketBuy') {
        // Explicit Market Buy
        this.newFilterForm.swapType.value = 1;
        this.newFilterForm.isLimit = 0;
      }
      this.newFilterForm.swapType.visible = false;
      this.page = 0;
      this.getUserTxHistory();
    },
    handleStatusCommand(command) {
      if (command === 'all') {
        this.newFilterForm.statusType.value = ''
      } else if (command === 'confirmed') {
        this.newFilterForm.statusType.value = 'confirmed'
      } else if (command === 'cancelled') {
        this.newFilterForm.statusType.value = 'cancelled'
      } else if (command === 'error') {
        this.newFilterForm.statusType.value = 'error'
      } else if (command === 'auto_cancelled') {
        this.newFilterForm.statusType.value = 'auto_cancelled'
      }
      this.newFilterForm.statusType.visible = false
      this.page = 0
      this.getUserTxHistory()
    },
    isActiveFilterNew(prop) {
      if (!prop) return false
      if (prop === 'volume') {
        let {defaultRange} = this.newFilterForm[prop]
        let {range} = this.newFilterConditions?.[prop] || {}
        return !(range?.[0] === defaultRange?.[0] && (range?.[1] === defaultRange?.[1] || range?.[1] === 0))
      } else if (prop === 'swapType') {
        let defaultValue = ['buy', 'sell']
        let value = this.newFilterConditions?.[prop]?.value || []
        return !(defaultValue.every(v => value.includes(v)))
      } else if (prop === 'statusType') {
        let defaultValue = ['confirmed', 'error', 'cancelled', 'waiting']
        let value = this.newFilterForm[prop].value || []
        return !(defaultValue.every(v => value.includes(v)))
      }
    },
    handleResetNew(val) {
      if (val.type === 'volume') {
        val.range = [...val.defaultRange]
      } else if (val.type === 'swapType') {
        val.value = ['buy', 'sell']
      } else if (val.type === 'statusType') {
        val.value = ['confirmed', 'error', 'cancelled', 'waiting']
      }
      this.handleFilterConfirmNew(val)
    },
    handleFilterConfirmNew(val) {
      if (val.type === 'volume') {
        this.newFilterConditions[val.type].range[0] = val.range[0] || 0
        this.newFilterConditions[val.type].range[1] = val.range[1] >= val.defaultRange[1] ? 0 : (val.range[1] || 0)
        console.log('newFilterConditions', this.newFilterConditions)
      } else if (val.type === 'swapType') {
        this.newFilterConditions[val.type].value = val.value || []
      } else if (val.type === 'statusType') {
        this.newFilterForm[val.type].value = val.value || []
      }
      val.visible = false
      this.page = 0
      this.getUserTxHistory()
    },
  }

}
</script>
<style lang="scss" scoped>

.table-field-text {
    color: var(--custom-text-2-color);
  }

.bot-swap-history {
  margin: 0 -10px;
  padding-bottom: 30px;

  .tabs {
    width: fit-content;
    border-radius: 4px;
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
      line-height: 24px;
      font-weight: 500;
      padding: 3px 6px;
      min-width: 60px;
      text-align: center;
    }
  }
  .action-buttons {
    display: flex;
    align-items: center;
    .btn-current-token {
      height: 24px;
      margin-left: 8px;
      font-size: 12px;
      border-radius: 4px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      background: rgba(63, 128, 247, 0.10);
      color: #3F80F7;
      &.active {
        background-color: #3F80F7;
        color: #fff;
      }
    }
  }
  :deep(.el-table) {
    --el-table-tr-bg-color: var(--custom-bg-1-color);
    --el-table-bg-color: var(--custom-bg-1-color);
    --el-table-text-color: var(--a-text-1-color);
    --el-table-header-bg-color: var(--custom-table-th-bg-color);
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

  /* 交易详情样式 */
  .transaction-details {
    margin: 20px 10px 0;
    padding: 15px;
    background: var(--custom-bg-1-color);
    border-radius: 8px;
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .detail-item {
      flex: 1;
      
      .detail-label {
        font-size: 12px;
        color: var(--custom-text-2-1-color);
        margin-bottom: 8px;
      }
      
      .detail-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--custom-text-1-color);
      }
    }
  }

  /* 顶部交易统计样式 */
  .transaction-stats {
    display: flex;
    justify-content: space-between;
    margin: 5px 0 15px;
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: var(--custom-bg-1-color);
    
    .stat-item {
      flex: 1;
      text-align: center;
      padding: 0 5px;
      
      .stat-label {
        font-size: 12px;
        color: var(--custom-text-1-color);
        margin-bottom: 6px;
      }
      
      .stat-value {
        font-size: 14px;
        font-weight: 500;
        /* color: var(--custom-text-1-color); */
        margin-bottom: 2px;
        
        &.token-amount {
          font-size: 13px;
        }
      }
      
      .stat-change {
        font-size: 12px;
      }
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

.dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  height: 23px;
}

.active-dropdown-item {
  color: var(--custom-primary-color) !important;
  font-weight: bold;
}

:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 8px 16px;
  
  &.active-dropdown-item {
    color: var(--custom-primary-color);
    font-weight: bold;
  }
}
</style>
