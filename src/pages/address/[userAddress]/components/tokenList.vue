<template>
  <div class="mt-[0px]">
    <el-table
      :key="tableIndex"
      ref="table_ref"
      :data="tableData"
      :default-sort="{
        prop: conditions.sort,
        order: conditions.sort_dir ? conditions.sort_dir + 'ending' : null,
      }"
      class="table-container"
      fit
      style="width: 100%"
      @row-click="jumpBalance"
      @sort-change="handleSortChange"
    >
      <AveEmpty v-if="0" style="height: 80px" :showText="false" />
      <TokenColumn
        :column-props="{
          label: $t('recentlyTrade'),
          width: '250',
          fixed: 'left',
          sortable: 'custom',
          sortOrders: ['descending', 'ascending', null],
          prop: 'last_txn_time',
        }"
      >
        <template v-if="isSelfAddress" #default="{ row }">
          <Icon name="bx:bxs-hide" @click.self.stop="hideToken(row)" class="absolute top-0 left-0"/>
        </template>
      </TokenColumn>
      <el-table-column
        :label="$t('total_profit')"
        :sort-orders="['descending', 'ascending', null]"
        align="right"
        prop="total_profit"
        sortable="custom"
      >
        <template #default="{ row }">
          <span v-if="row?.total_profit > 0" :style="{ color: upColor }">
            ${{ formatNumber(row?.total_profit || 0, 2) }}
          </span>
          <span v-else-if="row?.total_profit == 0" style="color: #959a9f">$0</span>
          <span v-else-if="row?.total_profit == '--'" style="color: #959a9f">--</span>
          <span v-else :style="{ color: downColor[7] }">
            {{ '-$' + formatNumber(Math.abs(row?.total_profit) || 0, 2) }}
          </span>
          <span
            :class="{
              'color-gray': row?.total_profit_ratio == '--' || row?.total_profit_ratio == 0,
            }"
            class="mini"
          >
            <template v-if="row?.total_profit_ratio == 0">0</template>
            <template v-else-if="row?.total_profit_ratio == '--'">--</template>
            <template v-else>
              <span :style="{ color: row?.total_profit_ratio > 0 ? upColor : downColor }">
                {{ formatNumber(row?.total_profit_ratio * 100 || 0, 2) }}%
              </span>
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('total_unrealized_profit')"
        :sort-orders="['descending', 'ascending', null]"
        align="right"
        prop="unrealized_profit"
        sortable="custom"
      >
        <template #default="{ row }">
          <span v-if="row?.unrealized_profit > 0" :style="{ color: upColor }">
            ${{ formatNumber(row?.unrealized_profit || 0, 2) }}
          </span>
          <span v-else-if="row?.unrealized_profit == 0" style="color: #959a9f">$0</span>
          <span v-else-if="row?.unrealized_profit == '--'" style="color: #959a9f">--</span>
          <span v-else :style="{ color: downColor[7] }">
            {{ '-$' + formatNumber(Math.abs(row?.unrealized_profit) || 0, 2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('balance1')"
        :sort-orders="['descending', 'ascending', null]"
        align="right"
        prop="balance_usd"
        sortable="custom"
      >
        <template #header>
          <span
            >{{ $t('balance1') }}
            <Icon
              name="custom:price"
              :class="`${isVolUSDT?'color-[--d-F5F5F5-l-222]' : 'color-#666'} cursor-pointer`"
              @click.stop.prevent="switch_amount_3 = !switch_amount_3"
            />
          </span>
        </template>
        <template #default="{ row }">
          <span v-if="row?.balance_usd == 0" class="color-gray">0</span>
          <span v-else-if="row?.balance_usd == '--'" class="color-gray">--</span>
          <template v-else>
            <template v-if="switch_amount_3">
              {{
                row?.main_token_price == 0
                  ? 0
                    : formatNumber(row?.balance_usd / row?.main_token_price || 0, 2)
              }}
              <span class="font-12 color-999 ml-3px">{{ row?.main_token_symbol }}</span>
            </template>
            <template v-else>
              {{ '$' + formatNumber(row?.balance_usd || 0, 2) }}
            </template>
          </template>
          <span
            :class="{ 'color-gray': row?.balance_amount == '--' || row?.balance_amount == 0 }"
            class="mini"
          >
            <template v-if="row?.balance_amount == 0">0</template>
            <template v-else-if="row?.balance_amount == '--'">--</template>
            <template v-else>
              {{ formatNumber(row?.balance_amount || 0, 2) }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wallet_detail_total_buy_avg')" align="right">
        <template #default="{ row }">
          <span v-if="row?.total_purchase_usd == 0" class="color-gray">0</span>
          <span v-else-if="row?.total_purchase_usd == '--'" class="color-gray">--</span>
          <template v-else>
            {{ '$' + formatNumber(row?.total_purchase_usd || 0, 2) }}
          </template>
          <span
            :class="{
              'color-gray':
                row?.average_purchase_price_usd == '--' || row?.average_purchase_price_usd == 0,
            }"
            class="mini"
          >
            <template v-if="row?.average_purchase_price_usd == 0">0</template>
            <template v-else-if="row?.average_purchase_price_usd == '--'">--</template>
            <template v-else>
              {{ '$' + formatNumber(row?.average_purchase_price_usd || 0, 2) }}
            </template>
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('wallet_detail_total_sell_avg')" align="right">
        <template #default="{ row }">
          <span v-if="row?.total_sold_usd == 0" class="color-gray">0</span>
          <span v-else-if="row?.total_sold_usd == '--'" class="color-gray">--</span>
          <template v-else>
            {{ '$' + formatNumber(row?.total_sold_usd || 0, 2) }}
          </template>
          <span
            :class="{
              'color-gray': row?.average_sold_price_usd == '--' || row?.average_sold_price_usd == 0,
            }"
            class="mini"
          >
            <template v-if="row?.average_sold_price_usd == 0">0</template>
            <template v-else-if="row?.average_sold_price_usd == '--'">--</template>
            <template v-else>
              {{ '$' + formatNumber(row?.average_sold_price_usd || 0, 2) }}
            </template>
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('wallet_detail_transfer_in_out')" align="right">
        <template #default="{ row }">
          <span
            :style="{
              color:
                row?.total_transfer_in_amount == '--' || row?.total_transfer_in_amount == 0
                  ? '#959a9f'
                  : upColor,
            }"
          >
            <template v-if="row?.total_transfer_in_amount == 0">0</template>
            <template v-else-if="row?.total_transfer_in_amount == '--'">--</template>
            <template v-else>
              {{ formatNumber(row?.total_transfer_in_amount || 0, 2) }}
            </template>
          </span>
          <span
            :style="{
              color:
                row?.total_transfer_out_amount == '--' || row?.total_transfer_out_amount == 0
                  ? '#959a9f'
                  : downColor[7],
            }"
            class="block"
          >
            <template v-if="row?.total_transfer_out_amount == 0">0</template>
            <template v-else-if="row?.total_transfer_out_amount == '--'">--</template>
            <template v-else>
              {{ formatNumber(row?.total_transfer_out_amount || 0, 2) }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wallet_detail_tx_count')" align="right">
        <template #default="{ row }">
          <span
            :style="{
              color:
                row?.total_purchase == '--' || row?.total_purchase == 0 ? '#959a9f' : upColor,
            }"
          >
            <template v-if="row?.total_purchase == 0">0</template>
            <template v-else-if="row?.total_purchase == '--'">--</template>
            <template v-else>
              {{ formatNumber(row?.total_purchase || 0, 2) }}
            </template>
          </span>
          <span :style="{ color: mode == 'light' ? '#D8D8D8' : '#666666' }">/</span>
          <span
            :style="{
              color: row?.total_sold == '--' || row?.total_sold == 0 ? '#959a9f' : downColor[7],
            }"
            class=""
          >
            <template v-if="row?.total_sold == 0">0</template>
            <template v-else-if="row?.total_sold == '--'">--</template>
            <template v-else>
              {{ formatNumber(row?.total_sold || 0, 2) }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('share')" align="right">
        <template #default="{ row }">
          <Share :statistics="row" :type="'topHolder'" :address="row.token" :chain="row.chain" />
        </template>
      </el-table-column>
    </el-table>
    <HideTokenDialog
      v-model="hideTokenVisible"
      :row="currentHideToken"
      :self_address="address"
      @hideToken="$emit('hideToken')"
    />
  </div>
</template>

<script setup>
// import { formatNumber2, formatNumberS } from '@/utils/formatNumber'
import HideTokenDialog from './hideTokenDialog.vue'
import TokenColumn from '@/components/tokenColumn.vue'
import AveEmpty from '@/components/aveEmpty.vue'
import Share from '@/components/share.vue'
const props = defineProps({
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
  conditions: {
    type: Object,
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
  isSelfAddress: Boolean,
  address: String,
})

const emit = defineEmits(['hideToken'])

const switch_amount_3 = ref(false)
const hideTokenVisible = ref(false)
const currentHideToken = ref({})

const themeStore = useThemeStore()

const mode = computed(() => {
  return themeStore.isDark ? 'dark' : 'light'
})
const upColor = 'green'
const downColor = 'red'

function jumpBalance(row) {
  // store.state.showPopTokenDetails = !store.state.showPopTokenDetails
  // store.state.token_user_address = props.address
  // store.state.token_user = {
  //   id: row.token + '-' + row.chain,
  //   symbol: row.symbol,
  //   logo_url: row.logo_url,
  //   chain: row.chain,
  //   address: '',
  //   remark: '',
  // }
}

function hideToken(row) {
  hideTokenVisible.value = true
  currentHideToken.value = row
}
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  overflow: initial;
  // min-height: calc(100vh - 220px);
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
  tr th{
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

// .trade {
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   a {
//     background: var(--custom-btn-bg-color);
//     padding: 5px 7px;
//     border-radius: 6px;
//     display: flex;
//     align-items: center;
//     font-size: 14px;
//     color: var(--custom-text-1-color);
//     .icon-svg {
//       // font-size: 12px;
//       // height: 12px;
//       // width: 12px;
//       margin-right: 3px;
//     }
//     &:hover {
//       opacity: 0.5;
//     }
//   }
// }
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

.icon-yincang {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  color: #959a9f;
  cursor: pointer;
}

.hover-row {
  .icon-yincang {
    display: block;
  }
}
</style>
