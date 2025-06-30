<template>
  <div class="statistics-table">
    <div class="flex-between mt_20 border-bottom">
      <div class="tabs">
        <a
          v-for="(item, index) in tabs"
          :key="index"
          :class="{ active: activeTab === item.id }"
          @click.stop.prevent="switchTab(item)"
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
      </div>
    </div>
    <div ref="listArea" class="mb-32px">
      <div
        v-infinite-scroll="onLoad"
        :infinite-scroll-delay="200"
        :infinite-scroll-disabled="tableData.loading || tableData.finished || tableData.error"
        :infinite-scroll-immediate="false"
        class="tableBox card relative"
        infinite-scroll-distance="300"
      >
        <!-- <loading
          v-if="tableData.pageNO === 1"
          v-model:active="tableData.loading"
          :backgroundColor="mode === 'light' ? '#fff' : '#131722'"
          :can-cancel="false"
          :is-full-page="false"
          :opacity="0.2"
          color="var(--custom-primary-color)"
          loader="dots"
        /> -->
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
        <div
          :style="{ color: mode === 'light' ? '#666' : '#999' }"
          class="mt-[5px] mb-[5px] text-[12px] text-center"
        >
          <span v-if="tableData.loading && tableData.pageNO > 1">{{ $t('loading') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TokenList from './tokenList.vue'
import TrendList from './trendList.vue'
import DeployedTokenList from './deployedTokenList.vue'
import BlackList from './blackList.vue'
import storage from 'good-storage'
import { getDeployedTokens, getWhaleTokenList, getWhaleTrendList } from '@/api/wallet'
const $t = getGlobalT()
const props = defineProps({
  chain: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  isSelfAddress: Boolean,
})

const activeTab = ref('trend')
const tableData = ref({
  finished: false,
  error: false,
  loading: false,
  pageNO: 1,
  pageSize: 40,
  total: 0,
  token: [],
  trend: [],
  deployedToken: [],
})
const max_block_number = ref(0)
const max_event_id = ref(0)
const conditions_wallet = ref(
  storage.get('conditions_wallet') || {
    hide_sold: 1,
    hide_small: 1,
    sort: 'last_txn_time',
    sort_dir: 'desc',
  }
)
const trendQuery = ref({
  event_type: '',
  volume_min: 0,
  volume_max: 0,
  hideNative: 1,
  checkAll: false,
  isIndeterminate: true,
  checkedTrend: ['SWAP', 'ADD_LIQUIDITY/REMOVE_LIQUIDITY'],
  sort_dir: 'desc',
  sort: 'block_time',
})
const deployedTokenQuery = ref({
  sort: 'market_cap',
  sort_dir: 'desc',
})

const deployedTokenNum = ref(0)
const listArea = ref(null)
const trendList = ref(null)

const themeStore = useThemeStore()

const mode = computed(() => {
  return themeStore.isDark ? 'dark' : 'light'
})

const tabs = computed(() => {
  const commonTabs = [
    { title: $t('walletActivity'), id: 'trend' },
    { title: $t('holding'), id: 'token' },
  ]
  if (deployedTokenNum.value > 0) {
    commonTabs.push({
      title: `${$t('deployedToken')}(${deployedTokenNum.value})`,
      id: 'deployedToken',
    })
  }
  return commonTabs
})

const isToken = computed(() => activeTab.value === 'token')
const isTrend = computed(() => activeTab.value === 'trend')
const chainAddress = computed(() => [props.chain, props.address])
const filterTableList = computed(() => {
  if (isToken.value) {
    return [...tableData.value.token]
  } else if (isTrend.value) {
    let trendList = tableData.value.trend.filter(
      (i) =>
        (i.is_target && (i.event_type === 'swap_buy' || i.event_type === 'swap_sell')) ||
        !(i.event_type === 'swap_buy' || i.event_type === 'swap_sell')
    )
    if (trendQuery.value.hideNative === 1) {
      const unSupport_arr = [
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        'So11111111111111111111111111111111111111112',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'Am5hwEp5VBqXoeE5pRU47RTW6gYeFQ6ahi1j4ZVVeL2V',
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      ]
      trendList = trendList.filter(
        (i) => unSupport_arr.findIndex((y) => y?.toLowerCase() === i.token?.toLowerCase()) === -1
      )
    }
    return trendList
  } else {
    return [...tableData.value.deployedToken]
  }
})

// Methods
const onConditionChange = (type) => {
  storage.set('conditions_wallet', conditions_wallet.value)
  tableData.value.pageNO = 1
  _getWhaleTokenList()
}

const onLoad = () => {
  if (isToken.value) _getWhaleTokenList()
  else if (isTrend.value) _getWhaleTrendList()
  else _getDeployedTokens()
}

const switchTab = (item) => {
  activeTab.value = item.id
  onRouteChange()
}

const handleSortChange = ({ prop, order }) => {
  resetPageNOAndLoading()
  const sort_dir = order?.replace?.('ending', '')
  if (isToken.value) {
    conditions_wallet.value.sort = prop
    conditions_wallet.value.sort_dir = sort_dir
    storage.set('conditions_wallet', conditions_wallet.value)
  } else if (isTrend.value) {
    trendQuery.value.sort = prop
    trendQuery.value.sort_dir = sort_dir
  } else {
    deployedTokenQuery.value.sort = prop
    deployedTokenQuery.value.sort_dir = sort_dir
  }
  onLoad()
}

const resetPageNOAndLoading = () => {
  tableData.value.pageNO = 1
  tableData.value.finished = false
  tableData.value.error = false
  tableData.value.loading = true
}

const _getWhaleTokenList = async () => {
  tableData.value.loading = true
  const data = {
    user_address: props.address,
    chain: props.chain,
    pageNO: tableData.value.pageNO,
    pageSize: tableData.value.pageSize,
    sort_dir: conditions_wallet.value.sort_dir,
    sort: conditions_wallet.value.sort,
    is_self: props.isSelfAddress ? 1 : 0,
    ...(conditions_wallet.value.hide_sold === 1 && { hide_sold: 1 }),
    ...(conditions_wallet.value.hide_small === 1 && { hide_small: 1 }),
  }

  try {
    const res = await getWhaleTokenList(data)
    if (data.pageNO === 1) {
      tableData.value.token = []
    }
    const list = Array.isArray(res) ? res : []
    if (list?.length > 0) {
      const a = [...tableData.value.token]
      const b = list.filter((i) => a.every((j) => !(j.token === i.token && j.chain === i.chain)))
      tableData.value.token = [...a, ...b]
    }
    tableData.value.finished = list?.length < tableData.value.pageSize
    if (!tableData.value.finished) {
      tableData.value.pageNO++
    }
  } catch {
    tableData.value.token = []
    tableData.value.error = true
  } finally {
    tableData.value.loading = false
  }
}

const refreshWhaleTrendList = (params) => {
  trendQuery.value = { ...trendQuery.value, ...params }
  tableData.value.pageNO = 1
  max_block_number.value = 0
  max_event_id.value = 0
  _getWhaleTrendList()
}

const getWhaleTrendParams = () => {
  const data = {
    user_address: props.address,
    chain: props.chain,
    pageNO: tableData.value.pageNO,
    pageSize: tableData.value.pageSize,
    max_block_number: max_block_number.value,
    max_event_id: max_event_id.value,
    event_type: '',
    volume_min: 0,
    volume_max: 0,
    block_time_min: trendQuery.value.block_time_min,
    block_time_max: trendQuery.value.block_time_max,
    sort_dir: trendQuery.value.sort_dir,
    sort: trendQuery.value.sort,
    ...(trendQuery.value.volume_min && { volume_min: trendQuery.value.volume_min }),
    ...(trendQuery.value.volume_max && { volume_max: trendQuery.value.volume_max }),
  }

  const trendLen = trendQuery.value.checkedTrend?.length
  if (trendLen > 0 && trendLen <= 5) {
    const event_type = trendQuery.value.checkedTrend
      .filter((i) => i !== 'all')
      .map((i) => i.replace('/', ','))
    data.event_type = event_type.toString()
  }
  return data
}

const _getWhaleTrendList = async () => {
  tableData.value.loading = true
  if (trendQuery.value.volume_min > trendQuery.value.volume_max) {
    store.dispatch('showMessage', {
      type: 'error',
      message: $t('maxGtMin'),
    })
    return
  }

  const params = getWhaleTrendParams()
  try {
    const res = await getWhaleTrendList(params)
    if (params.pageNO === 1) {
      tableData.value.trend = []
    }
    const list = Array.isArray(res) ? res : []
    const arr = list.map((i) => {
      let event_type = i.event_type
      if (i.event_type === 'SWAP') {
        event_type = i.flow_type === 0 ? 'swap_buy' : 'swap_sell'
      } else if (i.event_type === 'TRANSFER') {
        event_type = i.flow_type === 0 ? 'transfer_in' : 'transfer_out'
      }
      return { ...i, event_type }
    })

    if (arr?.length > 0) {
      const a = [...tableData.value.trend]
      const b = arr.filter((i) => a.every((j) => j.tx_hash !== i.tx_hash))
      tableData.value.trend = [...a, ...b]
    }
    tableData.value.finished = list?.length < tableData.value.pageSize
    if (!tableData.value.finished) {
      tableData.value.pageNO++
    }
    max_block_number.value = arr[arr?.length - 1]?.block_number
    max_event_id.value = arr[arr?.length - 1]?.event_id
  } catch (err) {
    tableData.value.trend = []
    tableData.value.error = true
  } finally {
    tableData.value.loading = false
  }
}

const refreshTokenList = () => {
  resetPageNOAndLoading()
  _getWhaleTokenList()
}

const onRouteChange = () => {
  resetPageNOAndLoading()
  if (isToken.value) {
    _getWhaleTokenList()
  } else if (isTrend.value) {
    max_block_number.value = 0
    max_event_id.value = 0
    _getWhaleTrendList()
  } else {
    _getDeployedTokens()
  }
}

const _getDeployedTokens = async () => {
  tableData.value.loading = true
  const params = {
    user_address: props.address,
    user_chain: props.chain,
    ...deployedTokenQuery.value,
  }
  try {
    const res = await getDeployedTokens(params)
    tableData.value.deployedToken = res
  } catch (err) {
    tableData.value.deployedToken = []
    tableData.value.error = true
  } finally {
    tableData.value.loading = false
  }
}

const getDeployedTokenNum = async () => {
  const params = {
    user_address: props.address,
    user_chain: props.chain,
    ...deployedTokenQuery.value,
  }
  try {
    const res = await getDeployedTokens(params)
    deployedTokenNum.value = res?.length || 0
  } catch (err) {
    console.log('error', err)
  }
}

const resetData = () => {
  statistics.value = {}
  tableData.value.token = []
  tableData.value.trend = []
}

// Watchers
watch(chainAddress, () => {
  if (props.address && props.chain) {
    resetPageNOAndLoading()
    onLoad()
    getDeployedTokenNum()
  }
})

// Lifecycle hooks
onMounted(() => {
  if (props.address && props.chain) {
    onLoad()
    getDeployedTokenNum()
  }
})
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
  :deep() {
    .el-checkbox {
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
