<template>
  <div class="bot-swap-history">
    <div class="flex" style="padding-right: 15px;" v-if="false">
      <div class="tabs">
        <template v-for="(item, index) in tabs" :key="index">
          <div class="line" v-if="item.value === 'unified'"></div>
          <input
            type="radio"
            :id="`tab-bot-order-item-${item.value}`"
            v-model="$store.state.bot.orderTabActive"
            :value="item.value"
            class="tab-radio-input"
          />
          <label :for="`tab-bot-order-item-${item.value}`" class="tab-item clickable-btn" v-if="item.value">
            {{ item.label }} {{ item.id === 'botLimitOrder' ? `(${pendingOrdersCount})` : ''}}
          </label>
        </template>
      </div>
      <el-checkbox v-model="botOrderOnlyCurrentToken" :label="$t('onlyCurrentToken')" size="small" style="display: none;" />
    </div>
    <div class="flex-between chain-tabs">
      <div class="tabs chain-tabs-list">
        <template v-for="item in chains" :key="item.chain">
          <input
            type="radio"
            :id="`tab-bot-chain-${item.chain}`"
            v-model="selectedChain"
            :value="item.chain"
            class="tab-radio-input"
            @change="handleChainChange(item.chain)"
          />
          <label :for="`tab-bot-chain-${item.chain}`" class="tab-item clickable-btn" v-if="item.chain">
            {{ $f.getChainInfo(item.chain).name }}
          </label>
        </template>
      </div>
      <div class="action-buttons">
        <button 
          class="btn-current-token" 
          :class="{ 'active': botOrderOnlyCurrentToken }"
          @click="toggleCurrentToken"
        >
          {{ $t('currentToken') }}
        </button>
        <button 
          class="btn-cancel-all" 
          :class="{ 'active': isCancelAllActive && hasPendingOrders }"
          @click="toggleCancelAll"
          :disabled="!hasPendingOrders"
        >
          {{ $t('cancelAll') }}
        </button>
      </div>
    </div>
    <!-- <BotMy ref="BotMy" v-show="$store.state.bot.orderTabActive === 'my'" :botOrderOnlyCurrentToken="botOrderOnlyCurrentToken" :txHistoryObj="txHistoryObj"></BotMy> -->
    <!-- <BotMarket v-show="$store.state.bot.orderTabActive === 'market'" :botOrderOnlyCurrentToken="botOrderOnlyCurrentToken" :txHistoryObj="txHistoryObj"></BotMarket> -->
    <BotUnified ref="botUnified" v-show="$store.state.bot.orderTabActive === 'unified' || this.$store.state.bot.orderTabActive === 'my'"  :botOrderOnlyCurrentToken="botOrderOnlyCurrentToken" :txHistoryObj="txHistoryObj" :selectedChain="selectedChain" @update:pending-count="updatePendingCount"></BotUnified>
  </div>
</template>
<script>
import { useStorage } from '@vueuse/core'
import BigNumber from 'bignumber.js'
import BotMarket from './market.vue'
import BotMy from './my.vue'
import BotUnified from './unified.vue'
// operate
let defaultVersion = 1
export default {
  name: 'BotLimitHistory',
  components: {
    BotMarket,
    BotMy,
    BotUnified
  },
  setup() {
    let botOrderOnlyCurrentToken = useStorage('bot_order_onlyCurrentToken', false, sessionStorage)
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
    let botOrderFilter = useStorage('bot_order_filter', defaultFilter, localStorage)
    if (botOrderFilter?.value?.version !== defaultVersion) {
      botOrderFilter.value = defaultFilter
    }
    return { botOrderOnlyCurrentToken, filterConditions: botOrderFilter }
  },
  data() {
    return {
      BigNumber,
      page: 0,
      pageSize: 50,
      txHistoryObj: {},
      typeFilter: {
        visible: false,
        value: ['buy', 'sell']
      },
      loading: false,
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
          value: this.filterConditions?.swapType?.value || ['buy', 'sell'],
          defaultValue: ['buy', 'sell']
        }
      },
      loadingCancel: {},
      // chains: [
      //   { value: 'BSC', label: 'BSC' },
      //   { value: 'Solana', label: 'Solana' },
      //   { value: 'ETH', label: 'ETH' },
      //   { value: 'Tron', label: 'Tron' },
      //   { value: 'Sui', label: 'Sui' }
      // ],
      selectedChain: 'solana',
      isCancelAllActive: true,
      activeTab: 'unified'
    }
  },
  computed: {
    chains() {
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
    txHistory() {
      let filterType = this.filterConditions?.swapType?.value || ['buy', 'sell']
      let botOrderOnlyCurrentToken = this.botOrderOnlyCurrentToken
      let token = this.$store.state?.tokenInfo?.address || this.token?.address || ''
      let orderTabActive = this.$store.state.bot.orderTabActive
      return (this.txHistoryObj?.[orderTabActive] || [])?.filter(i => filterType?.includes?.(i?.swapType === 5 ? 'buy' : 'sell') && (botOrderOnlyCurrentToken ? (i?.inTokenAddress === token || i?.outTokenAddress === token) : true))
    },
    tabs() {
      return [
        {
          value: 'my',
          label: this.$t('myOrders'),
        },
        {
          value: 'market',
          label: this.$t('marketOrders'),
        },
        {
          value: 'unified',
          label: this.$t('unifiedOrders'),
        }
      ]
    },
    pendingOrdersCount() {
      return this.$store.state.bot.pendingOrdersCount
    },
    hasPendingOrders() {
      // 只检查当前选中链的待处理订单
      const orderTabActive = this.$store.state.bot.orderTabActive;
      const token = this.$store.state?.tokenInfo?.address || '';
      const key = this.botOrderOnlyCurrentToken ? ('my_' + token) : 'my';
      const orders = this.txHistoryObj?.[key] || [];
      
      // 筛选当前链且状态为等待中的订单
      const pendingOrders = orders.filter(order => 
        order.status === 'waiting' && 
        order.chain === this.selectedChain
      );
      
      return pendingOrders.length > 0;
    }
  },
  created() {
    // 只有当 selectedChain 为空时才设置
    if (!this.selectedChain && this.$store.state.bot?.userInfo?.addresses?.length > 0) {
      // 优先查找 solana 链
      const solanaAddress = this.$store.state.bot.userInfo.addresses.find(addr => addr.chain === 'solana');
      if (solanaAddress) {
        this.selectedChain = 'solana';
      } else {
        this.selectedChain = this.$store.state.bot.userInfo.addresses[0].chain || '';
      }
      
      if (this.$store.state.bot.orderTabActive === 'unified') {
        this.$nextTick(() => {
           this.$refs.botUnified.getUserPendingTx();
        });
      }
    }
  },
  watch: {
    'chains'(newChains) {
      // 只有当 selectedChain 为空时才设置
      if (newChains?.length > 0 && !this.selectedChain) {
        // 优先查找 solana 链
        const solanaChain = newChains.find(chain => chain.chain === 'solana');
        if (solanaChain) {
          this.selectedChain = 'solana';
        } else {
          this.selectedChain = newChains[0].chain || '';
        }
        
        if (this.$store.state.bot.orderTabActive === 'unified') {
          this.$nextTick(() => {
             this.$refs.botUnified.getUserPendingTx();
          });
        }
      }
    },
    '$store.state.bot.orderTabActive'(newVal) {
      if (newVal === 'my') {
        this.$store.commit('setOrderTabActive', 'unified');
      }
    },
    // 监听当前 token 链的变化
    '$store.state.tokenInfo.chain'(newChain) {
      if (newChain) {
        // 检查当前链是否在支持的链列表中
        const chainExists = this.chains.some(item => item.chain === newChain);
        if (chainExists) {
          this.selectedChain = newChain;
          this.$nextTick(() => {
            if (this.$refs.botUnified) {
              this.$refs.botUnified.getUserPendingTx();
            }
          });
        }
      }
    }
  },
  methods: {
    toggleCurrentToken() {
      this.botOrderOnlyCurrentToken = !this.botOrderOnlyCurrentToken;
    },
    toggleCancelAll() {
      // 如果没有待处理订单，直接返回
      if (!this.hasPendingOrders) {
        return;
      }
      
      this.$store.dispatch('bot_cancelAllLimitOrdersByGuidWeb', {chain: this.selectedChain}).then(res => {
        this.$nextTick(() => {
          if (this.$refs.botUnified) {
            this.$refs.botUnified.getUserPendingTx();
            this.$message.success(this.$t('cancelAllSuccess'));
          }
        });
      }).catch(err => this.$message.error(this.$t('cancelAllFailed')))
    },
    executeCancelAll() {
      const orderTabActive = this.$store.state.bot.orderTabActive;
      console.log("🚀 ~ executeCancelAll ~ orderTabActive:", orderTabActive)
      
      if (orderTabActive === 'unified') {
        // 调用 BotUnified 组件的批量取消方法
        console.log('executeCancelAll', this.$refs.botUnified)
        this.$refs.botUnified.batchCancelOrders();
        this.isCancelAllActive = false; // 操作完成后重置按钮状态
      } else {
        // 原有的逻辑
        const token = this.$store.state?.tokenInfo?.address || '';
        const key = this.botOrderOnlyCurrentToken ? (orderTabActive + '_' + token) : orderTabActive;
        const orders = this.txHistoryObj?.[key] || [];
        
        const pendingOrders = orders.filter(order => 
          order.status === 'waiting' && 
          (this.selectedChain ? order.chain?.toUpperCase() === this.selectedChain : true)
        );
        
        if (pendingOrders.length === 0) {
          this.$message.info(this.$t('noPendingOrders'));
          this.isCancelAllActive = false;
          return;
        }
        
        this.$confirm(this.$t('confirmCancelAllOrders'), '', {
          confirmButtonText: this.$t('confirm1'),
          cancelButtonText: this.$t('cancel')
        }).then(() => {
          const promises = pendingOrders.map(order => {
            return this.$store.dispatch('bot_cancelOrder', {
              chain: order.chain,
              orderId: order.batchId
            });
          });
          
          Promise.all(promises).then(() => {
            this.$message.success(this.$t('cancelAllSuccess'));
            this.$refs.botUnified && this.$refs.botUnified.getOrderList();
          }).catch(() => {
            this.$message.error(this.$t('cancelAllFailed'));
            this.$refs.botUnified && this.$refs.botUnified.getOrderList();
          });
        }).catch(() => {
          this.isCancelAllActive = false;
        });
      }
    },
    handleChainChange(chain) {
      console.log('Chain changed to:', chain);
      this.selectedChain = chain;
      this.$nextTick(() => {
          this.$refs.botUnified.getUserPendingTx();
          // this.$refs.BotMy.getUserPendingTx();
      });
    },
    handleTabChange(tab) {
      this.activeTab = tab
    },
    updatePendingCount(count) {
      this.pendingOrdersCount = count
    }
  }
}
</script>
<style lang="scss" scoped>
.bot-swap-history {
  margin: 0 -10px;
  padding-bottom: 30px;
  .table-field-text {
    color: var(--d-999-l-959A9F);
  }
  .tabs {
    width: fit-content;
    border-radius: 4px;
    /* border: var(--custom-br); */
    // padding: 1px;
    display: flex;
    /* margin: 5px 10px 10px 10px; */
    font-size: 12px;
    .tab-divider {
      width: 1px;
      height: 14px;
      background: #959A9F;
      margin: 0 8px;
    }
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
      min-width: 60px;
      text-align: center;
    }
    .line {
      width: 1px;
      height: 14px;
      background-color: var(--app-color-border);
      margin: 0 10px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .chain-tabs {
    margin: 5px 10px 15px 10px;
    .action-buttons {
      display: flex;
      align-items: center;
      .btn-current-token,
      .btn-cancel-all {
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
      }
      .btn-current-token {
        background: rgba(63, 128, 247, 0.10);
        color: #3F80F7;
        &.active {
          background-color: #3F80F7;
          color: #fff;
        }
      }
      .btn-cancel-all {
        background: rgba(255, 255, 255, 0.10);
        color: #696E7C;
        &.active {
          background: rgba(246, 70, 93, 0.10);
          color: #F6465D;
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
          color: #696E7C;
        }
      }
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
