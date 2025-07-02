<template>
  <div class="mt_20">
    <el-table
      ref="table_ref"
      :data="tableData"
      :key="tableIndex"
      fit
      style="width: 100%"
      class="table-container"
      @row-click="jumpTokenDetail"
    >
      <AveEmpty/>
      <TokenColumn
        :column-props="{
          label: $t('walletToken'),
          width: '250',
          fixed: 'left',
        }"
      />
      <el-table-column :label="$t('time')">
        <template #header>
          <span>{{ $t('time') }}</span>
          <el-popover
            placement="bottom"
            popper-class="chains-table-filter"
            :width="430"
            trigger="click"
            v-model:visible="filterForm.time.visible"
          >
            <template #reference>
              <Icon
                name="custom:filter"
                class="color-[--d-666-l-999] cursor-pointer text-10px ml-3px"
                :style="{
                  color:
                    trendQuery.block_time_min && trendQuery.block_time_max
                      ? 'var(--custom-primary-color)'
                      : '',
                }"
                @click.stop
              />
            </template>
            <template #default>
              <div class="filter-box" :class="mode">
                <div class="text-14px font-400" style="color: var(--a-text-1-color)">
                  {{ $t('filterByDate') }}
                </div>
                <div class="flex text-12px mt-10px" style="color: var(--a-text-2-color)">
                  <span style="flex: 1.2">{{ $t('startTime') }}</span>
                  <span class="flex-1">{{ $t('endTime2') }}</span>
                </div>
                <el-date-picker
                  style="--el-date-editor-width: 100%"
                  class="mt-5px"
                  v-model="filterForm.time.value"
                  type="datetimerange"
                  range-separator="To"
                  start-placeholder="yyyy/mm/dd hh:mm"
                  end-placeholder="yyyy/mm/dd hh:mm"
                  format="YYYY-MM-DD HH:mm"
                  value-format="X"
                  prefix-icon="Calendar"
                  :teleported="false"
                />
                <div class="flex mt-20px">
                  <div class="flex clickable" style="cursor: pointer">
                    <span class="filter-title">{{ $t('sort') }}</span>
                    <div class="chain-icon-sort-container">
                      <svg
                        class="icon-svg"
                        aria-hidden="true"
                        :class="filterForm.time.sort_dir === 'asc' ? 'active' : ''"
                        @click.stop="localSortChange('block_time', 'asc')"
                      >
                        <use xlink:href="#icon-sort-up"></use>
                      </svg>
                      <svg
                        class="icon-svg"
                        aria-hidden="true"
                        :class="filterForm.time.sort_dir === 'desc' ? 'active' : ''"
                        @click.stop="localSortChange('block_time', 'desc')"
                      >
                        <use xlink:href="#icon-sort-down"></use>
                      </svg>
                    </div>
                  </div>
                  <el-button
                    size="default"
                    style="height: 30px; margin-left: auto; --el-button-font-weight: 400"
                    :color="isLight ? '#f2f2f2' : '#333333'"
                    @click.stop="resetTime"
                  >
                    {{ $t('reset') }}
                  </el-button>
                  <el-button
                    size="default"
                    type="primary"
                    :color="isLight ? '#222222' : '#f5f5f5'"
                    style="height: 30px; min-width: 70px; --el-button-font-weight: 400"
                    @click.stop="confirmTime"
                  >
                    {{ $t('confirm') }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          <span class="grey">
            {{ dayjs(row.block_time * 1000).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="right" :label="$t('type')">
        <template #header>
          <span>{{ $t('type') }}</span>
          <el-popover
            placement="bottom"
            popper-class="chains-table-filter"
            :width="207"
            trigger="click"
            v-model:visible="filterForm.type.visible"
          >
            <template #reference>
              <Icon
                name="custom:filter"
                :style="{ color: !trendQuery.checkAll ? 'var(--custom-primary-color)' : '' }"
                class="color-[--d-666-l-999] cursor-pointer text-10px ml-3px"
              />
            </template>
            <template #default>
              <div class="checkbox-container">
                <el-checkbox
                  v-model="filterForm.type.checkAll"
                  :indeterminate="filterForm.type.isIndeterminate"
                  @change="handleCheckAllChange"
                >
                  {{ $t('all') }}
                </el-checkbox>
                <el-checkbox-group
                  class="checkbox-vertical"
                  v-model="filterForm.type.checkedTrend"
                  @change="handleCheckedChange"
                >
                  <el-checkbox
                    v-for="(item, $index) in trendTypeList"
                    :key="$index"
                    :label="item.name"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="mt-20 flex">
                <el-button
                  size="default"
                  style="height: 30px; min-width: 70px; --el-button-font-weight: 400"
                  :color="isLight ? '#f2f2f2' : '#333333'"
                  @click.stop="filterForm.type.visible = false"
                >
                  {{ $t('cancel') }}
                </el-button>
                <el-button
                  size="default"
                  :color="isLight ? '#222222' : '#f5f5f5'"
                  style="height: 30px; min-width: 70px; --el-button-font-weight: 400"
                  @click.stop="confirmTypeFilter"
                >
                  {{ $t('confirm') }}
                </el-button>
              </div>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          <span
            :style="{
              color: filterType(row?.event_type)?.color == 'green' ? upColor : downColor,
            }"
          >
            {{ filterType(row?.event_type)?.name }}
          </span>
        </template>
      </el-table-column>

      <el-table-column align="right" :label="$t('price')">
        <template #default="{ row }">
          <span class="grey">
            ${{ row?.token_price_u > 0 ? formatNumber(row?.token_price_u || 0, 2) : 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="right" :label="$t('amount')">
        <template #default="{ row }">
          <div
            style="
              display: flex;
              align-items: end;
              justify-content: flex-end;
              flex-direction: column;
            "
            v-if="row?.event_type === 'ADD_LIQUIDITY' || row?.event_type === 'REMOVE_LIQUIDITY'"
          >
            <span class="text-10px ellipsis">
              {{ row?.amount > 0 ? formatNumber(row?.amount || 0, 2) : 0 }}
              <span class="color-#959A9F">{{ row?.symbol }}</span>
            </span>
            <span class="block text-10px ellipsis">
              {{ row?.amount > 0 ? formatNumber(row?.token1_amount || 0, 2) : 0 }}
              <span class="color-#959A9F">{{ row?.token1_symbol }}</span>
            </span>
          </div>
          <span v-else>
            {{ row?.amount > 0 ? formatNumber(row?.amount || 0, 2) : 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="right" :label="$t('value')">
        <template #header>
          <span>{{ $t('value') }}</span>
          <el-popover
            placement="bottom"
            popper-class="chains-table-filter"
            :width="300"
            trigger="click"
            v-model:visible="filterForm.price.visible"
          >
            <template #reference>
              <Icon
                name="custom:filter"
                class="color-[--d-666-l-999] cursor-pointer text-10px ml-3px"
                :style="{
                  color:
                    trendQuery.volume_min && trendQuery.volume_max
                      ? 'var(--custom-primary-color)'
                      : '',
                }"
              />
            </template>
            <template #default>
              <span class="text-12px font-400 filter-title">{{ $t('value') }}($)</span>
              <div class="flex mt-10">
                <el-input
                  class="height_36"
                  v-model.trim.number="filterForm.price.volume_min"
                  :placeholder="$t('minor')"
                  clearable
                />
                <span class="ml-10 mr-10">~</span>
                <el-input
                  class="height_36"
                  v-model.trim.number="filterForm.price.volume_max"
                  :placeholder="$t('max1')"
                  clearable
                />
              </div>
              <div class="mt-10">
                <el-button
                  style="height: 30px; min-width: 60px; --el-button-font-weight: 400"
                  :color="isLight ? '#f2f2f2' : '#333333'"
                  class="flex-1"
                  @click="resetPrice"
                  >{{ $t('reset') }}
                </el-button>
                <el-button
                  :color="isLight ? '#222222' : '#f5f5f5'"
                  style="height: 30px; min-width: 60px; --el-button-font-weight: 400"
                  type="primary"
                  class="flex-1"
                  @click="confirmPrice"
                  >{{ $t('confirm') }}
                </el-button>
              </div>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          ${{ row?.volume > 0 ? formatNumber(row?.volume || 0, 2) : 0 }}
        </template>
      </el-table-column>
      <el-table-column align="right" label="TXN">
        <template #default="{ row }">
          <a class="ml-5 a-gray font-16" href="" @click.stop.prevent="goLink(row)">
            <Icon
              name="custom:browser"
              class="text-16px color-[--d-666-l-999] cursor-pointer"
              @click.stop.self="goBrowser(row)"
            />
          </a>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import AveEmpty from '@/components/aveEmpty.vue'
// import { formatNumber2 } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import TokenColumn from '@/components/tokenColumn.vue'
const props = defineProps({
  trendQuery: {
    type: Object,
    default: () => ({}),
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  tableIndex: {
    type: Number,
    default: 0,
  },
  handleSortChange: {
    type: Function,
    default: () => {},
  },
  handleSort: {
    type: Function,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pageNO: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['refreshWhaleTrendList'])
const $t = getGlobalT()
const filterForm = ref({
  type: {
    visible: false,
    checkAll: false,
    checkedTrend: [],
    isIndeterminate: false,
  },
  price: {
    visible: false,
    volume_min: '',
    volume_max: '',
  },
  time: {
    visible: false,
    value: [],
    sort_dir: props.trendQuery.sort_dir,
    sort: props.trendQuery.sort,
  },
})

const themeStore = useThemeStore()

const mode = computed(() => {
  return themeStore.isDark ? 'dark' : 'light'
})
import { downColor, upColor } from '@/utils/constants'

const trendTypeList = computed(() => [
  { id: 'SWAP', name: $t('swap_buy') + '/' + $t('swap_sell') },
  {
    id: 'ADD_LIQUIDITY/REMOVE_LIQUIDITY',
    name: $t('ADD_LIQUIDITY') + '/' + $t('REMOVE_LIQUIDITY'),
  },
  { id: 'TRANSFER', name: $t('wallet_detail_transfer_in_out') },
  { id: 'BURN', name: $t('BURN') },
  { id: 'MINT', name: $t('mint1') },
])

// Initialize form values
onMounted(() => {
  filterForm.value.type.checkedTrend = props.trendQuery.checkedTrend
  filterForm.value.type.checkAll = props.trendQuery.checkAll
  filterForm.value.type.isIndeterminate = props.trendQuery.isIndeterminate
})

// Methods
function filterType(type) {
  const o = {
    swap_buy: {
      name: $t('swap_buy'),
      color: 'green',
    },
    swap_sell: {
      name: $t('swap_sell'),
      color: 'red',
    },
    AUTHORITY: {
      name: $t('AUTHORITY'),
      color: 'red',
    },
    ADD_LIQUIDITY: {
      name: $t('ADD_LIQUIDITY'),
      color: 'green',
    },
    NEW_COIN: {
      name: $t('NEW_COIN'),
      color: 'green',
    },
    MINT: {
      name: $t('MINT'),
      color: 'green',
    },
    FREEZE: {
      name: $t('FREEZE'),
      color: 'red',
    },
    transfer_in: {
      name: $t('transfer_in'),
      color: 'green',
    },
    transfer_out: {
      name: $t('transfer_out'),
      color: 'red',
    },
    BURN: {
      name: $t('BURN'),
      color: 'red',
    },
    NEW_PAIR: {
      name: $t('NEW_PAIR'),
      color: 'red',
    },
    THAW: {
      name: $t('THAW'),
      color: 'green',
    },
    BALANCE_CHANGE: {
      name: $t('BALANCE_CHANGE'),
      color: 'red',
    },
    REMOVE_LIQUIDITY: {
      name: $t('REMOVE_LIQUIDITY'),
      color: 'red',
    },
  }
  return o[type]
}

function goLink(row) {
  window.open(formatExplorerUrl(row.chain, row.tx_hash, 'tx'))
}

function tableRowClick(row) {
  // router.push({
  //   name: 'Token',
  //   params: { id: row.token + '-' + row.chain },
  //   query: { from: router.currentRoute.value.name },
  // })
}

const tokenDetailSStore = useTokenDetailsStore()
const botStore = useBotStore()

function jumpTokenDetail(row) {
  tokenDetailSStore.$patch({
    drawerVisible: true,
    tokenInfo: {
      id: row.token + '-' + row.chain,
      symbol: row.symbol,
      logo_url: row.logo_url,
      chain: row.chain,
      address: row.token,
      remark: '',
    },
    pairInfo: {
      target_token: row.token,
      token0_address: row.token,
      token0_symbol: row.symbol,
      token1_symbol: row.token1_symbol,
      pairAddress: ''
    },
    user_address: botStore.getWalletAddress(row.chain)
  })
  // store.state.showPopTokenDetails = !store.state.showPopTokenDetails
  // store.state.token_user_address =
  //   router.currentRoute.value.params?.userAddress ||
  //   store.state?.bot?.userInfo?.addresses?.find?.((i) => i?.chain === 'solana')?.address ||
  //   store.state.currentAccount
  // store.state.token_user = {
  //   id: row.token + '-' + row.chain,
  //   symbol: row.symbol,
  //   logo_url: row.logo_url,
  //   chain: row.chain,
  //   address: '',
  //   remark: '',
  // }
}

function handleCheckAllChange(val) {
  filterForm.value.type.checkedTrend = val ? trendTypeList.value?.map((i) => i.id) : []
  filterForm.value.type.isIndeterminate = false
}

function handleCheckedChange(val) {
  const checkedCount = val.length
  const checkAll = checkedCount === trendTypeList.value.length
  const isIndeterminate = checkedCount > 0 && checkedCount < trendTypeList.value.length
  filterForm.value.type.checkAll = checkAll
  filterForm.value.type.isIndeterminate = isIndeterminate
}

function resetTime() {
  filterForm.value.time.value = []
  filterForm.value.time.sort_dir = 'desc'
  filterForm.value.time.sort = 'block_time'
  emit('refreshWhaleTrendList', {
    ...props.trendQuery,
    block_time_min: 0,
    block_time_max: 0,
    sort_dir: 'desc',
    sort: 'block_time',
  })
  filterForm.value.time.visible = false
}

function parentSetTime({ block_time_min, block_time_max } = {}) {
  filterForm.value.time.value = [block_time_min, block_time_max]
  confirmTime()
}

function confirmTime() {
  const [block_time_min, block_time_max] = filterForm.value.time.value || []
  emit('refreshWhaleTrendList', {
    ...props.trendQuery,
    block_time_min,
    block_time_max,
    sort_dir: filterForm.value.time.sort_dir,
    sort: filterForm.value.time.sort,
  })
  filterForm.value.time.visible = false
}

function confirmTypeFilter() {
  const { checkAll, checkedTrend } = filterForm.value.type
  emit('refreshWhaleTrendList', {
    ...props.trendQuery,
    checkAll,
    checkedTrend,
  })
  filterForm.value.type.visible = false
}

function resetPrice() {
  filterForm.value.price.volume_min = ''
  filterForm.value.price.volume_max = ''
  emit('refreshWhaleTrendList', {
    ...props.trendQuery,
    volume_min: '',
    volume_max: '',
  })
  filterForm.value.price.visible = false
}

function confirmPrice() {
  const { volume_max, volume_min } = filterForm.value.price
  emit('refreshWhaleTrendList', {
    ...props.trendQuery,
    volume_max,
    volume_min,
  })
  filterForm.value.price.visible = false
}

function localSortChange(sort, sort_dir) {
  filterForm.value.time.sort = sort
  filterForm.value.time.sort_dir = sort_dir
}
</script>
<style lang="scss" scoped>
:deep(.el-table) {
  overflow: initial;
  min-height: calc(100vh - 220px);

  .el-table__header-wrapper {
    position: sticky;
    top: 0px;
    z-index: 3;
  }

  .sort-caret {
    &.ascending {
      border-bottom-color: var(--a-text-2-color);
    }

    &.descending {
      border-top-color: var(--a-text-2-color);
    }
  }

  tr th {
    background: #0a0b0d !important;
  }

  tr {
    cursor: pointer;

    &:hover {
      td {
        &.el-table__cell {
          // background-color: var(--custom-td-hover-2-color);
        }
      }
    }
  }

  .cell {
    line-height: 15px;
    padding: 0 3px;
  }

  th {
    // background: var(--custom-primary-lighter-2-color);
    border-bottom: none;

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

  td {
    &.el-table__cell {
      // padding: 6px 0;
      // border-bottom: 1px solid var(--custom-td-border-1-color);
      // border-right: 1px solid var(--custom-td-border-1-color);
      font-weight: 400;
    }

    .cell {
      // color: var(--custom-font-1-color);
      overflow: visible;
    }
  }
}

.icon-token-container {
  margin-right: 4px;

  .icon-symbol {
    left: 20px;
    top: 20px;
  }
}

.plus {
  font-size: 20px;
  line-height: 20px;
  display: block;
  height: 20px;
  margin-right: 10px;
}

.progress {
  margin-left: 3px;

  :deep().el-progress__text {
    min-width: 12px;
  }

  .icon-suo1 {
    width: 8px;
    height: 8px;
  }
}

.icon-svg1 {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.token-info {
  display: flex;
  align-items: center;

  .token-symbol {
    // white-space: nowrap;
    // overflow: hidden;
    // text-overflow: ellipsis;
    font-size: 14px;
    margin-right: 3px;
  }

  .token-network {
    border: 1px solid #878fbc;
    border-radius: 10px;
    font-size: 12px;
    color: #878fbc;
    padding: 2px 5px;
    margin-left: 9px;
  }

  .token-icon {
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }
}

.table-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
  min-height: calc(100vh - 750px);
}

.icon-svg {
  font-size: 20px;
  cursor: pointer;
  color: var(--custom-primary-color);
  border-radius: 100%;
  width: 20px;
  vertical-align: middle;

  &.icon-huoyan {
    width: 12px;
    font-size: 12px;
  }

  &.icon-new {
    font-size: 12px;
  }

  &.icon-xiala {
    width: 8px;
    height: 8px;
    margin-left: 5px;
  }
}

.icon-shaixuan {
  &:hover {
    cursor: pointer;
    color: var(--custom-primary-color);
  }
}

.filter-box {
  color: var(--custom-text-1-color);

  .filter-title {
    font-size: 12px;
    color: var(--a-text-2-color);
  }

  // :deep() .el-input__wrapper {
  //   .el-input__inner{
  //     color: var(--custom-font-1-color);
  //   }
  // }
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

.popper-gold {
  .title {
    color: var(--a-text-2-color);
  }

  ul {
    li {
      a {
        color: var(--custom-text-1-color);
        padding: 6px 15px;
        display: flex;

        .icon-bianzu,
        .icon-dexs1 {
          color: var(--a-text-1-color);
        }

        &.disabled {
          color: var(--a-text-2-color);

          &:hover {
            cursor: not-allowed;
          }
        }

        &:hover {
          opacity: 1;
          text-decoration: none;
          background: var(--custom-btn-2-color);
        }
      }
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 15px 0;
  }

  .tag-left {
    margin-left: 3px;
    width: 12px;
    height: 12px;
  }

  .tag-left2 {
    margin-left: 3px;
    width: 19px;
    height: 17px;
  }
}

.icon-danger {
  color: red;
}

.color-gray {
  color: #959a9f;
  font-size: 12px;
}

.mini {
  font-size: 12px;
  color: #959a9f;
  display: block;
}

.token-address {
  gap: 4px;
  font-size: 10px;
  color: var(--d-666-l-959a9f);

  .iconfont {
    font-size: 10px;
  }
}

.checkbox-container {
  > a {
    cursor: pointer;

    &:hover {
      color: #999;
    }
  }
}

.checkbox-vertical {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.grey {
  color: var(--d-666-l-959a9f);
}
</style>
