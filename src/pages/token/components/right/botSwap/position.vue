<template>
  <div class="bot-swap-history">
    <div class="flex" style="padding-right: 15px;">
      <el-input
        class="search-input"
        v-model="keyword"
        style="width: 260px"
        :placeholder="$t('search1')"
        size="small"
        clearable
        prefix-icon="Search"
      />
      <el-checkbox
        style="--el-checkbox-text-color: var(--a-text-2-color);--el-checkbox-checked-text-color: var(--a-text-2-color);--el-checkbox-checked-bg-color: var(--a-text-1-color);--el-checkbox-checked-input-border-color: var(--a-text-1-color);--el-checkbox-checked-icon-color: var(--a-bg-4-color);"
        v-model="isFilterHighRisk"
        size="small"
      >
        {{ $t('hideRiskToken') }}
      </el-checkbox>
    </div>
    <PositionTable v-if="currentAccount " :tokenList="tokenList" :loading="loading" ></PositionTable>
  </div>
</template>
<script>
// import { utils } from 'ethers'
import PositionTable from './positionTable.vue'
import { useIsFilterHighRisk } from '@/utils/hook.js'
import { evm_utils as utils } from '@/utils/utils.js'

let Timer = null
let Timer1 = null
export default {
  name: 'BotSwapPosition',
  components: {
    // Search
    PositionTable
  },
  setup() {
    let isFilterHighRisk = useIsFilterHighRisk()
    return {
      isFilterHighRisk
    }
  },
  data() {
    return {
      loading: false,
      keyword: ''
    }
  },
  computed: {
    currentAccount() {
      return this.$store.state.currentAccount || this.$store.state.bot?.userInfo?.evmAddress || ''
    },
    tokenList() {
      let reg = new RegExp(this.keyword, 'i')
      // let chain = this.$store.state.tokenInfo?.chain
      return (this.$store.getters.allChainsBalances || []).filter(i => reg.test(i?.symbol || '') || reg.test(i?.token || ''))
    },
    currentPrice() {
      return this.$store.state.tokenPrice || this.$store.state.tokenInfo.priceUSD
    },
  },
  watch: {
    '$store.state.bot.historyUpdate'(val) {
      if (val) {
        let time = Date.now()
        this.getAddressBalances().then(res => {
          if (res?.length > 0) {
            this.getAddressBalances_poll(time)
          }
        })
      }
    },
    // '$store.state.tokenInfo.address'(val) {
    //   if (val) {
    //     this.init()
    //   }
    // }
    currentPrice(val) {
      if (val && (this.$store.getters.allChainsBalances || []).some(i => i.token === this.$store.state.tokenInfo.address)) {
        if (Timer1) {
          if (Timer){
            clearTimeout(Timer)
            Timer = null
          }
        } else {
          if (!Timer) {
            this.getAddressBalances()
          } else {
            return
          }
        }
        Timer = setTimeout(() => {
          this.getAddressBalances()
          Timer = null
        }, 30000)
      }
    },
    '$store.state.bot.subscribeResult'(val) {
      if (val && val?.swapType > 2) {
        this.getAddressBalances()
      }
    },
    '$store.state.tokenInfo.address'(val) {
      if (val) {
        this.getAddressBalances()
      }
    },
    isFilterHighRisk() {
      if (this.$store.state.tokenInfo.address) {
        this.getAddressBalances()
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    formatUnits: utils.formatUnits,
    init() {
      this.getAddressBalances()
    },
    getAddressBalances_poll(time) {
      Timer1 = setTimeout(() => {
        this.getAddressBalances().finally(() => {
          if (Date.now() < time + 30000) {
            this.getAddressBalances_poll(time)
          } else {
            clearTimeout(Timer1)
            Timer1 = null
          }
        })
      }, 5000)
    },
    getAddressBalances() {
      this.loading = true
      // let data = {
      //   // pinToken: this.$store.state.tokenInfo.address
      //   // chain: chain
      // }
      return this.$store.dispatch('bot_getAddressBalances').then(async res => {
        return res
      }).finally(() => {
        this.loading = false
      })
    },
    tableRowClick(row) {
      if (!row.txHash) {
        return
      }
      window.open(this.$f.formatExplorerUrl(row.chain, row.txHash, 'tx'))
    }
  }

}
</script>
<style lang="scss" scoped>
.bot-swap-history {
  margin: 0 -10px;
  .search-input {
    margin: 5px 10px 10px 10px;
    --el-input-border-color: var(--custom-br-1-color);
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
