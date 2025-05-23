<template>
  <div>
    <el-table
      :data="txHistory"
      fit
      stripe
      max-height="700"
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
      <el-table-column :label="$t('type')" align="right" prop="isBuy">
        <template #header>
          <span>{{ $t('type') }}</span>
          <el-dropdown trigger="click" @command="handleTypeCommand">
            <span class="dropdown-link">
              <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: isActiveFilter('volume') ? 'var(--custom-primary-color)' : ''}"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ $t('all') }}</el-dropdown-item>
                <el-dropdown-item command="5">{{ $t('limitBuy') }}</el-dropdown-item>
                <el-dropdown-item command="6">{{ $t('limitSell') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="{ row }">
          <span class="btn-type" :class="row?.isBuy ? 'btn-buy' : 'btn-sell'" :style="{ color: row?.isBuy ? $store.getters.upColor[3] : $store.getters.downColor[3] }">
            {{$t('limit') }}/{{ row?.isBuy ? $t('buy') : $t('sell') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('price')" align="right">
        <template #header>
          <span>{{ $t('price') }}</span>
        </template>
        <template #default="{ row }">
          <span class="table-field-text">${{ $f.formatNumber2(row?.PriceLimit || 0) }}</span>
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
          <span class="table-field-text">{{ $f.formatNumberS(Number(row?.inValue) || 0, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('amount1')" align="right">
        <template #header>
          <span>{{ $t('amount1') }}</span>
        </template>
        <template #default="{ row }">
          <span class="table-field-text">
            <template v-if="!row?.isBuy">
              {{ !!Number(row?.inAmount) ? $f.formatNumber2(formatUnits(new BigNumber(row?.inAmount || 0).toFixed(0), row.inTokenDecimals || 0), 4) : '--' }} {{ !!Number(row?.inAmount) ? row?.inTokenSymbol : '' }}
            </template>
            <template v-else>
              {{ !!Number(row?.outputAmount) ? $f.formatNumber2(formatUnits(new BigNumber(row?.outputAmount || 0).toFixed(0), row.outTokenDecimals || 0), 4) : '--'  }} {{ !!Number(row?.outputAmount) ? row?.outTokenSymbol : '' }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('status')" align="right">
        <template #header>
          <div class="type-header">
            <span>{{ $t('status') }}</span>
            <el-dropdown v-if="false" trigger="click" @command="handleStatusCommand">
              <span class="dropdown-link">
              <i class="iconfont icon-guolv1 text-10px ml-3 clickable" :style="{color: isActiveFilter('volume') ? 'var(--custom-primary-color)' : ''}"></i>
            </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="全部">全部</el-dropdown-item>
                  <el-dropdown-item command="挂单中">挂单中</el-dropdown-item>
                  <el-dropdown-item command="部分成交">部分成交</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
        <template #default="{ row }">
          <span v-if="row.status === 'confirmed'" class="table-field-text">{{ $t('completed') }}</span>
          <!-- <span v-else-if="row.status === 'error'" style="color: var(--custom-text-2-color);word-break: break-all;">{{ $t('failed') }}<template v-if="row?.errorLog">({{ formatBotError(row?.errorLog) }})</template></span> -->
          <span v-else-if="row.status === 'cancelled'" class="table-field-text">{{ $t('cancelled1') }}</span>
          <span v-else-if="row.status === 'sent'" class="table-field-text">{{ $t('sent') }}</span>
          <span v-else-if="row.status === 'waiting'" class="table-field-text">{{ $t('pendingOrder') }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('CreateTime')" align="right">
        <template #header>
          <div class="flex-end">
            <span>{{ $t('CreateTime') }}</span>
          </div>
        </template>
        <template #default="{ row }">
          <span class="table-field-text">{{ isShowDate ? $f.formatDate(row.time, 'YYYY/MM/DD HH:mm') : $dayjs(row.time * 1000).fromNow() }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('ExpirationTime')" align="right">
        <template #default="{ row }">
          <span class="table-field-text">{{ isShowDate ? $f.formatDate(row.time + 7*24*60*60, 'YYYY/MM/DD HH:mm') : $dayjs((row.time + 7*24*60*60) * 1000).fromNow() }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column :label="$t('operate')" align="right">
        <template #header>
          <span>{{ $t('operate') }}</span>
        </template>
        <template #default="{ row }">
          <el-button  :loading="!!loadingCancel[row.batchId]" size="small" :color="$store.state.mode !== 'dark' ? '#222222' : '#f5f5f5'"  @click.stop="handleCancelOrder(row)">{{ $t('cancel') }}</el-button>
        </template>
      </el-table-column> -->

      <el-table-column :label="$t('operate')" align="right">
        <template #default="{ row }">
          <button 
            v-if="row.status === 'waiting'"
            class="btn-cancel"
            @click.stop="handleCancelOrder(row)"
            :loading="loadingCancel[row.batchId]"
          >
            {{ $t('Cancel') }}
          </button>

          <div v-else>
            -
          </div>

        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('operation')" align="right">
        <template #header>
          <span>{{ $t('operation') }}</span>
        </template>
        <template #default="{ row }">
          <i v-if="row.status == 'confirmed' && !row?.isBuy && row.chain === 'solana'" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" class="iconfont icon-fenxiangtubiao ml-5 clickable" @click.stop="openDialog(row)"></i>
          <i v-if="row.txHash" class="iconfont icon-qukuailianliulanqi-baitian font-12  ml_10" style="cursor: pointer; font-size: 16px; color: var(--custom-text-2-color)" @click.stop.prevent="jumpExplorerUrl(row)"></i>
        </template>
      </el-table-column> -->

     
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
    selectedChain: String
  },
  components: {
    'van-count-down': CountDown,
  },
  setup() {
    // let isShowDate = useStorage('bot_limit_market_date_isShow', true, localStorage)
    let isShowDate = true
    let defaultFilter = {
      volume: {
        type: 'volume',
        range: [0, 100000],
      },
      swapType: {
        type: 'swapType',
        value: ['buy', 'sell']
      },
      statusType: {
        type: 'statusType',
        value: ['waiting', 'confirmed', 'error', 'cancelled', 'sent']
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
        },
        statusType: {
          type: 'statusType',
          visible: false,
          value: this.filterConditions?.statusType?.value || ['waiting', 'confirmed', 'error', 'cancelled', 'sent'],
          defaultValue: ['waiting', 'confirmed', 'error', 'cancelled', 'sent']
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
      let history = (this.txHistoryObj?.[key] || [])?.filter(i => 
        (botOrderOnlyCurrentToken ? (i?.inTokenAddress === token || i?.outTokenAddress === token) : true)
      )

      // Filter by swapType
      if (filterType.length === 1) {
        if (filterType[0] === 'buy') {
          history = history.filter(i => i.swapType === 5)
        } else if (filterType[0] === 'sell') {
          history = history.filter(i => i.swapType === 6)
        }
      }

      // Update pending orders count in store
      const pendingCount = history.filter(order => order.status === 'waiting').length
      this.$store.commit('setPendingOrdersCount', pendingCount)

      return history
    },
    orderTabActive() {
      return this.$store.state.bot.orderTabActive
    },
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
      let chain = this.selectedChain
      let orderTabActive = this.$store.state.bot.orderTabActive
      chain = this.$store.state.bot.isSupportChains?.includes?.(chain) ? chain : ''
      // if (orderTabActive === 'unified') {
      //   chain = this.$store.state.bot.isSupportChains?.includes?.(chain) ? chain : ''
      //   if (!chain) {
      //     return
      //   }
      // } else {
      //   return
      // }
      let swapTypeList = this.filterConditions?.swapType.value
      let swapTypeBuy = swapTypeList?.includes?.('buy')
      let swapTypeSell = swapTypeList?.includes?.('sell')
      let swapType = (swapTypeBuy && swapTypeSell) ? 0 : ((swapTypeBuy && !swapTypeSell) ? 5 : 6)
      let token = this.$store.state?.tokenInfo?.address || this.token?.address || ''
      console.log("🚀 ~ getUserPendingTx ~ token:", token)
      let range = this.filterConditions?.volume?.range?.slice?.(0) || [0, 0]
      if (range[0] > range[1]) {
        range = [range[1], range[0]]
      }
      if (range[1] === 100000) {
        range[1] = 0
      }

      // Get the wallet address for the current chain
      const walletAddress = this.sortedAddresses.find?.(addr => addr.chain === chain)?.address || ''

      let data = {
        chain,
        token: this.botOrderOnlyCurrentToken ? token : '',
        walletAddress: walletAddress
      }
      this.loading = true

      // 我的订单
      return this.$store.dispatch('bot_getUserPendingTxWeb', data).then(async res => {
        let key = data.token ? ('my_' + data.token) : 'my'
        this.$store.commit('setPendingOrdersCount', res.length ?? 0)
        // eslint-disable-next-line vue/no-mutating-props
        this.txHistoryObj[key] = res?.map(i => {
          let time = new Date(i.createTime).getTime() / 1000
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
      } else if (val.type === 'statusType') {
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
      } else if (val.type === 'statusType') {
        val.value = ['waiting', 'confirmed', 'error', 'cancelled', 'sent']
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
    handleTypeCommand(command) {
      if (command === 'all') {
        this.filterConditions.swapType.value = ['buy', 'sell']
      } else if (command === '5') {
        this.filterConditions.swapType.value = ['buy']
      } else if (command === '6') {
        this.filterConditions.swapType.value = ['sell']
      }
      this.page = 0
      this.getUserPendingTx()
    },
    getTypeFilterText() {
      const values = this.filterForm['swapType'].value;
      if (values.includes('buy') && values.includes('sell')) {
        return this.$t('all');
      } else if (values.includes('buy')) {
        return this.$t('limitBuy');
      } else if (values.includes('sell')) {
        return this.$t('limitSell');
      }
      return this.$t('all');
    },
    handleStatusCommand(command) {
      if (command === '全部') {
        this.filterForm['statusType'].value = ['waiting', 'confirmed', 'error', 'cancelled', 'sent'];
      } else if (command === '挂单中') {
        this.filterForm['statusType'].value = ['waiting'];
      } else if (command === '部分成交') {
        this.filterForm['statusType'].value = ['confirmed'];
      }
      
      this.handleFilterConfirm(this.filterForm['statusType']);
    },
    getStatusFilterText() {
      const values = this.filterForm['statusType'].value;
      const allStatuses = ['waiting', 'confirmed', 'error', 'cancelled', 'sent'];
      
      if (allStatuses.every(status => values.includes(status))) {
        return '全部';
      } else if (values.includes('waiting') && !values.includes('confirmed') && !values.includes('error') && !values.includes('cancelled') && !values.includes('sent')) {
        return '挂单中';
      } else if (values.includes('confirmed') && values.length === 1) {
        return '部分成交';
      }
      
      return '全部'; // 默认值
    },
    // 批量取消订单
    batchCancelOrders() {
      // 获取所有等待中的订单
      const pendingOrders = this.txHistory.filter(order => order.status === 'waiting');
      
      if (pendingOrders.length === 0) {
        this.$message.info(this.$t('noPendingOrders'));
        return;
      }
      
      this.$confirm(this.$t('confirmCancelAllOrders'), '', {
        confirmButtonText: this.$t('confirm1'),
        cancelButtonText: this.$t('cancel')
      }).then(async () => {
        // 创建进度指示器
        const loadingInstance = this.$loading({
          lock: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        
        try {
          // 串行执行取消操作以避免同时过多的请求
          for (let i = 0; i < pendingOrders.length; i++) {
            const order = pendingOrders[i];
            loadingInstance.text = this.$t('cancellingOrders', { current: i + 1, total: pendingOrders.length });
            
            try {
              this.loadingCancel[order.batchId] = true;
              await this.$store.dispatch('bot_cancelLimitOrdersByBatch', {
                chain: order.chain, 
                batchId: order.batchId
              });
            } catch (err) {
              console.error('Failed to cancel order:', order.batchId, err);
            } finally {
              this.loadingCancel[order.batchId] = false;
            }
          }
          
          // 取消完成后刷新列表
          this.$message.success(this.$t('cancelAllSuccess'));
          this.getUserPendingTx();
        } catch (err) {
          this.$message.error(this.$t('cancelAllFailed'));
          console.error('Batch cancel failed:', err);
        } finally {
          loadingInstance.close();
        }
      }).catch(() => {
        // 用户取消操作
      });
    }
  }

}
</script>
<style lang="scss" scoped>

.bot-swap-history {
  margin: 0 -10px;
  padding-bottom: 30px;
  .table-field-text {
    color: var(--custom-text-2-color);
  }
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
.dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  height: 23px;
}

:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu) {
  background-color: var(--custom-bg-1-color);
  border: 1px solid var(--custom-br-1-color);
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #F6465D;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
