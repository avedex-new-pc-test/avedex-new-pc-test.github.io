<template>
  <div class="statistics-table">
    <div class="flex-between mt_20 border-bottom">
      <div class="tabs">
        <a
          v-for="(item, index) in tabs"
          :key="index"
          :class="{ active: activeTab === item.id }"
          @click="switchTab(item)"
        >
          {{ item.title }}
        </a>
      </div>
      <div v-if="isToken" class="checkbox-container align-center gap-10">
        <el-checkbox
          v-model="conditions_wallet.hide_sold"
          :false-value="0"
          :true-value="1"
          label="Option 1"
          @change="onConditionChange('hide_sold')"
        >
          {{ $t('hide_sell') }}
        </el-checkbox>
        <el-checkbox
          v-model="conditions_wallet.hide_small"
          :false-value="0"
          :true-value="1"
          label="Option 2"
          @change="onConditionChange('hide_small')"
        >
          {{ $t('hideSmallAssets1') + '<1USD' }}
        </el-checkbox>
        <BlackList
          v-if="isSelfAddress"
          :chain="chain"
          :address="address"
          @addWhite="refreshTokenList"
        />
      </div>
      <div v-else-if="isTrend" class="checkbox-container">
        <el-checkbox
          v-model="trendQuery.hideNative"
          :false-value="0"
          :true-value="1"
          label="Option 2"
        >
          {{ $t('hideNative') }}
        </el-checkbox>
        <!--        <a-->
        <!--          class="font-14 color-999 font_weight_500 ml_30"-->
        <!--          @click="showTrendPop = true"-->
        <!--        >-->
        <!--          <i class="iconfont icon-a-shaixuan-pc"></i>-->
        <!--          {{ $t('filters') }}-->
        <!--        </a>-->
      </div>
    </div>
    <div ref="listArea">
      <div
        v-infinite-scroll="onLoad"
        :infinite-scroll-delay="200"
        :infinite-scroll-disabled="tableData.loading || tableData.finished || tableData.error"
        :infinite-scroll-immediate="false"
        class="tableBox card relative"
        infinite-scroll-distance="300"
      >
        <loading
          v-if="tableData.pageNO ===1"
          v-model:active="tableData.loading"
          :backgroundColor="mode === 'light' ? '#fff' : '#131722'"
          :can-cancel="false"
          :is-full-page="false"
          :opacity="0.2"
          color="var(--custom-primary-color)"
          loader="dots"
        ></loading>
        <TokenList
          v-if="isToken"
          :conditions="conditions_wallet"
          :handleSortChange="handleSortChange"
          :loading="tableData.loading"
          :tableData="filterTableList"
          :isSelfAddress="isSelfAddress"
          :address="address"
          @hideToken="refreshTokenList"
        />
        <TrendList
          v-else-if="isTrend"
          ref="trendList"
          :handleSortChange="handleSortChange"
          :tableData="filterTableList"
          :trendQuery="trendQuery"
          @refreshWhaleTrendList="refreshWhaleTrendList"
        />
        <DeployedTokenList
          v-else
          :conditions="deployedTokenQuery"
          :handleSortChange="handleSortChange"
          :loading="tableData.loading"
          :tableData="filterTableList"
        />
        <div :style="{color: mode==='light'? '#666' : '#999'}" class="mt_20 font-14 tc">
          <span v-if="tableData.loading && tableData.pageNO > 1">{{ $t('loading') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TokenList from "@/views/wallet/tokenList.vue";
import TrendList from "@/views/wallet/trendList.vue";
import DeployedTokenList from "./deployedTokenList.vue";
import BlackList from "./blackList.vue";

import storage from "good-storage";
import {mapState} from "vuex";
import {getDeployedTokens, getWhaleTokenList, getWhaleTrendList} from "@/api";

export default {
  name: "StatisticsTable",
  components: {BlackList, DeployedTokenList, TrendList, TokenList},
  props: {
    chain: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    isSelfAddress: Boolean
  },
  data() {
    return {
      activeTab: "trend",
      tableData: {
        finished: false,
        error: false,
        loading: false,
        pageNO: 1,
        pageSize: 40,
        total: 0,
        token: [],
        trend: [],
        deployedToken: []
      },
      max_block_number: 0,
      max_event_id: 0,
      // 持仓筛选条件
      conditions_wallet: storage.get('conditions_wallet') || {
        hide_sold: 1,
        hide_small: 1,
        sort: 'last_txn_time',
        sort_dir: 'desc'
      },
      // 活动筛选条件
      trendQuery: {
        event_type: '',
        volume_min: 0,
        volume_max: 0,
        hideNative: 1,
        checkAll: false,
        isIndeterminate: true,
        checkedTrend: ['SWAP', 'ADD_LIQUIDITY/REMOVE_LIQUIDITY'],
        sort_dir: 'desc',
        sort: 'block_time'
      },
      deployedTokenQuery: {
        sort: 'market_cap',
        sort_dir: 'desc'
      },
      // showTrendPop: false,
      statistics: {},
      deployedTokenNum: 0
    }
  },
  computed: {
    ...mapState(['mode']),
    tabs() {
      const commonTabs = [
        {title: this.$t('walletActivity'), id: 'trend'},
        {title: this.$t('holding'), id: 'token'},
      ]
      const {deployedTokenNum} = this
      if (deployedTokenNum > 0) {
        commonTabs.push(
          {title: `${this.$t('deployedToken')}(${deployedTokenNum})`, id: 'deployedToken'}
        )
      }
      return commonTabs
    },
    isToken() {
      return this.activeTab === "token"
    },
    isTrend() {
      return this.activeTab === "trend"
    },
    currentApi() {
      const apiMap = {
        token: this.getWhaleTokenList,
        trend: this.getWhaleTrendList,
        deployedToken: this.getDeployedTokens
      }
      return apiMap[this.activeTab] || apiMap.trend
    },
    filterTableList() {
      if (this.isToken) {
        let list = this.tableData.token.slice()
        return list || []
      } else if (this.isTrend) {
        let trendList = this.tableData.trend.filter(
          i =>
            (i.is_target && (i.event_type === 'swap_buy' || i.event_type === 'swap_sell')) ||
            !(i.event_type === 'swap_buy' || i.event_type === 'swap_sell')
        )
        if (this.trendQuery.hideNative === 1) {
          const unSupport_arr = [
            '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            'So11111111111111111111111111111111111111112',
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            'Am5hwEp5VBqXoeE5pRU47RTW6gYeFQ6ahi1j4ZVVeL2V',
            '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
          ]
          trendList = trendList.filter(
            i => unSupport_arr.findIndex(y => y?.toLowerCase() === i.token?.toLowerCase()) == -1
          )
        }
        return trendList
      } else {
        return this.tableData.deployedToken.slice()
      }
    },
    chainAddress() {
      return [this.chain, this.address]
    },
  },
  watch: {
    chainAddress() {
      if (this.address && this.chain) {
        this.resetPageNOAndLoading()
        this.currentApi()
        this.getDeployedTokenNum()
      }
    }
  },
  mounted() {
    if (this.address && this.chain) {
      this.currentApi()
      this.getDeployedTokenNum()
    }
    // this.$nextTick(() => {
    //   this.$refs.listArea.addEventListener('scroll', this.handleScroll, true)
    // })
  },
  // beforeUnmount() {
  //   this.$refs.listArea.removeEventListener('scroll', this.handleScroll)
  // },
  beforeRouteLeave() {
    this.$store.commit('setState', {name: 'token_user', value: {}})
    this.$store.state.token_user_address = ''
  },
  methods: {
    handleScroll(e) {
      //滚动条滚动时，距离顶部的距离
      // console.log('----e-----',e,e.target)
      const scrollTop = e.target.scrollTop;
      //可视区的高度
      const windowHeight = e.target.clientHeight;
      //滚动条的总高度
      const scrollHeight = e.target.scrollHeight;
      //滚动条到底部的条件
      console.log('scrollTop:', scrollTop, 'windowHeight:', windowHeight, 'scrollHeight', scrollHeight, 'sum', scrollTop + windowHeight)
      if (scrollHeight - scrollTop - windowHeight >= 0 && scrollHeight - scrollTop - windowHeight < 300) {
        // 判断数据是否加载完成、是否正在加载
        if (!this.tableData.finished && !this.tableData.loading && this.address) {
          // 获取数据方法
          // 在请求数据方法中，将loading修改为true，防止重复触发
          // 在情书数据结束后，将loading修改为false
          // 在所有数据请求完成后，将allLoaded修改为true
          this.onLoad()
        }
      }
    },
    onConditionChange() {
      storage.set('conditions_wallet', this.conditions_wallet)
      this.tableData.pageNO = 1
      this.getWhaleTokenList()
    },
    onLoad() {
      if (this.activeTab === 'deployedToken') {
        return
      }
      this.currentApi()
    },
    switchTab(item) {
      this.activeTab = item.id
      this.onRouteChange()
    },
    handleSortChange({prop, order}) {
      this.resetPageNOAndLoading()
      const sort_dir = order?.replace?.('ending', '')
      if (this.isToken) {
        this.conditions_wallet.sort = prop
        this.conditions_wallet.sort_dir = sort_dir
        storage.set('conditions_wallet', this.conditions_wallet)
      } else if (this.isTrend) {
        this.trendQuery.sort = prop
        this.trendQuery.sort_dir = sort_dir
      } else {
        this.deployedTokenQuery.sort = prop
        this.deployedTokenQuery.sort_dir = sort_dir
      }
      this.currentApi()
    },
    resetPageNOAndLoading() {
      this.tableData.pageNO = 1
      this.tableData.finished = false
      this.tableData.error = false
      this.tableData.loading = true
    },
    getWhaleTokenList() {
      this.tableData.loading = true
      let data = {
        user_address: this.address,
        chain: this.chain,
        pageNO: this.tableData.pageNO,
        pageSize: this.tableData.pageSize,
        sort_dir: this.conditions_wallet.sort_dir,
        sort: this.conditions_wallet.sort,
        is_self: this.isSelfAddress ? 1 : 0
      }
      if (this.conditions_wallet.hide_sold === 1) {
        data.hide_sold = 1
      }
      if (this.conditions_wallet.hide_small === 1) {
        data.hide_small = 1
      }
      getWhaleTokenList(data)
        .then(res => {
          if (data.pageNO === 1) {
            this.tableData.token = []
          }
          let list = Array.isArray(res) ? res : []
          if (list?.length > 0) {
            let a = [...(this.tableData.token || [])]
            let b = list?.filter?.(i => a.every(j => !(j.token === i.token && j.chain === i.chain))) || []
            this.tableData.token = [...a, ...b]
          }
          this.tableData.finished = list?.length < this.tableData.pageSize
          if (!this.tableData.finished) {
            this.tableData.pageNO++
          }
        })
        .catch(err => {
          this.tableData.token = []
          this.tableData.error = true
        })
        .finally(() => {
          this.tableData.loading = false
        })
    },
    refreshWhaleTrendList(params) {
      this.trendQuery = {
        ...this.trendQuery,
        ...params
      }
      this.tableData.pageNO = 1
      this.max_block_number = 0
      this.max_event_id = 0
      this.getWhaleTrendList()
    },
    getWhaleTrendList() {
      this.tableData.loading = true
      if (this.trendQuery.volume_min > this.trendQuery.volume_max) {
        this.$message.error(this.$t('maxGtMin'))
        return
      }
      const params = this.getWhaleTrendParams()
      getWhaleTrendList(params)
        .then(res => {
          if (params.pageNO === 1) {
            this.tableData.trend = []
          }
          let list = Array.isArray(res) ? res : []
          let arr = list.map(i => {
            let event_type = i.event_type
            if (i.event_type === 'SWAP' && i.flow_type === 0) {
              event_type = 'swap_buy'
            }
            if (i.event_type === 'SWAP' && i.flow_type === 1) {
              event_type = 'swap_sell'
            }
            if (i.event_type === 'TRANSFER' && i.flow_type === 0) {
              event_type = 'transfer_in'
            }
            if (i.event_type === 'TRANSFER' && i.flow_type === 1) {
              event_type = 'transfer_out'
            }
            return {
              ...i,
              event_type: event_type
            }
          })

          if (arr?.length > 0) {
            let a = [...(this.tableData.trend || [])]
            let b = arr?.filter?.(i => a.every(j => j.tx_hash !== i.tx_hash)) || []
            this.tableData.trend = [...a, ...b]
          }
          this.tableData.finished = list?.length < this.tableData.pageSize
          if (!this.tableData.finished) {
            this.tableData.pageNO++
          }
          this.max_block_number = arr[arr?.length - 1]?.block_number
          this.max_event_id = arr[arr?.length - 1]?.event_id
        })
        .catch(err => {
          this.tableData.trend = []
          this.tableData.error = true
        })
        .finally(() => {
          this.tableData.loading = false
        })
    },
    getWhaleTrendParams() {
      let data = {
        user_address: this.address,
        chain: this.chain,
        pageNO: this.tableData.pageNO,
        pageSize: this.tableData.pageSize,
        max_block_number: this.max_block_number,
        max_event_id: this.max_event_id,
        event_type: '',
        volume_min: 0,
        volume_max: 0,
        block_time_min: this.trendQuery.block_time_min,
        block_time_max: this.trendQuery.block_time_max,
        sort_dir: this.trendQuery.sort_dir,
        sort: this.trendQuery.sort
      }
      if (this.trendQuery.volume_min) {
        data.volume_min = this.trendQuery.volume_min
      }
      if (this.trendQuery.volume_max) {
        data.volume_max = this.trendQuery.volume_max
      }
      const trendLen = this.trendQuery.checkedTrend?.length
      if (trendLen === 0) {
        data.event_type = ''
      }
      if (trendLen > 0 && trendLen <= 5) {
        let event_type = this.trendQuery.checkedTrend?.filter?.(i => i !== 'all')
        event_type = event_type?.map(i => i.replace('/', ','))
        data.event_type = event_type?.toString()
      }
      return data
    },
    refreshTokenList() {
      this.resetPageNOAndLoading()
      this.getWhaleTokenList()
    },
    onRouteChange() {
      this.resetPageNOAndLoading()
      if (this.isToken) {
        this.getWhaleTokenList()
      } else if (this.isTrend) {
        this.max_block_number = 0
        this.max_event_id = 0
        this.getWhaleTrendList()
      } else {
        this.getDeployedTokens()
      }
    },
    getDeployedTokens() {
      this.tableData.loading = true
      const params = {
        user_address: this.address,
        user_chain: this.chain,
        ...this.deployedTokenQuery
      }
      getDeployedTokens(params).then(res => {
        this.tableData.deployedToken = res
      }).catch(() => {
        this.tableData.deployedToken = []
        this.tableData.error = true
      })
        .finally(() => {
          this.tableData.loading = false
        })
    },
    getDeployedTokenNum() {
      const params = {
        user_address: this.address,
        user_chain: this.chain,
        ...this.deployedTokenQuery
      }
      getDeployedTokens(params).then(res => {
        this.deployedTokenNum = res?.length || 0
      }).catch((err) => {
        console.log("error", err)
      })
    },
    resetData() {
      this.statistics = {}
      this.tableData.token = []
      this.tableData.trend = []
    },
  }
}
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid var(--custom-primary-lighter-14-color);
}

.checkbox-container {
  > a {
    cursor: pointer;

    &:hover {
      color: #999;
    }
  }
  :deep(){
    .el-checkbox{
      margin-right: 0;
    }
  }
}

.tabs {
  padding: 10px 5px;
  font-size: 16px;

  > a {
    font-size: 14px;
    color: #999;
    text-align: center;
    font-weight: 500;
    line-height: 16px;
    text-decoration: none;
    border-bottom: 3px solid transparent;
    padding-bottom: 10px;
    margin-right: 30px;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    &.active {
      color: var(--a-text-1-color);
      border-bottom: 3px solid var(--a-text-1-color);
    }
  }
}

.tableBox {
  :deep(.el-table) {
    --el-table-tr-bg-color: var(--custom-bg-1-color);
    --el-table-bg-color: var(--custom-bg-1-color);
    --el-table-text-color: var(--a-text-1-color);
    --el-table-header-bg-color: var(--a-btn-bg-1-color);
    --el-fill-color-lighter: var(--custom-bg-1-color);
    --el-table-header-text-color: var(--a-text-2-color);
    --el-table-border-color: var(--a-br-1-color);
    --el-table-row-hover-bg-color: var(--a-table-hover-bg-color);
    background: var(--custom-bg-1-color);
    --el-bg-color: var(--custom-bg-1-color);
    overflow: initial;
    min-height: calc(100vh - 600px);
    font-size: 14px;
    .el-scrollbar__wrap {
      overflow-y: hidden;
    }

    .el-table__header-wrapper {
      position: sticky;
      top: 47px;
      z-index: 3;
    }

    .sort-caret {
      &.ascending {
        border-bottom-color: var(--custom-font-8-color);
      }

      &.descending {
        border-top-color: var(--custom-font-8-color);
      }
    }

    a {
      color: currentColor;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }

    tr {
      cursor: pointer;
    }

    .cell {
      line-height: 17px;
      padding: 0 1px;
    }

    th {
      padding: 6px 5px 6px 5px;
      border-bottom: none !important;
      height: 40px;

      &.el-table__cell.is-leaf {
        border-bottom: none;

        &.descending {
          .cell {
            color: var(--el-table-header-text-color);

            .sort-caret {
              &.descending {
                border-top-color: var(--a-btn-bg-2-color);
              }
            }
          }
        }

        &.ascending {
          .cell {
            color: var(--el-table-header-text-color);

            .sort-caret {
              &.ascending {
                border-bottom-color: var(--a-btn-bg-2-color);
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

    td {
      height: 60px;

      &.el-table__cell {
        z-index: 0;
        padding: 6px 5px 6px 5px;
        border-bottom: 0.5px solid var(--custom-br-1-color);
        font-weight: 400;
      }
    }

    th:first-child,
    td:first-child {
      padding-left: 20px;
    }

    th:last-child,
    td:last-child {
      padding-right: 20px;
    }

    .token-symbol {
      color: var(--a-text-1-color);
    }

    .trade {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      a {
        background: var(--a-bg-4-color);
        padding: 5px 7px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--a-text-1-color);

        .icon-svg {
          margin-right: 3px;
        }

        &:hover {
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
