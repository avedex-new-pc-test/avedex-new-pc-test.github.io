<template>
  <el-dialog v-model="dialogVisible" class="dialog-position" :title="$t('myPosition1')" width="680" append-to-body>
    <el-table class="table-position w-100%" :data="dataSource" stripe :height="400" @row-click="() => { }">
      <el-table-column 
        v-for="col in columns" :key="col.prop" :label="col.label" :width="col.width" :prop="col.prop"
        :align="col.align">
        <template #header="{ column }">
          <div v-if="column.property == 'total_profit_ratio'" class="flex items-center text-right justify-end">
            <span>{{ column.label }}</span>
            <el-tooltip :effect="mode" placement="top-end" :content="$t('PnLTips')">
              <el-icon style="cursor: pointer; font-size: 14px; margin-left: 2px;">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
          <div v-else>
            {{ column.label }}
          </div>
        </template>
        <template #default="{ row }">
          <div>
            <template v-if="col?.prop === 'token'">
              <div class="flex items-center gap-8px">
                <TokenImg :row="row" class="w-24px h-24px" />
                <div>{{ row?.symbol }}</div>
              </div>
            </template>
            <span v-else-if="row[col.prop] === '--'">--</span>
            <span v-else-if="row[col.prop] === 0">0</span>
            <span v-else :class="col?.getClassName ? col.getClassName(row) : ''">{{ col.formatter ? col.formatter(row) :row[col.prop] }}</span>
            <Icon v-if="col?.prop === 'total_profit_ratio'" name="circum:share-1" class="text-12px ml-4px" />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="tsx">
// import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import TokenImg from '@/components/tokenImg.vue'
import { getUserBalance ,type GetUserBalanceResponse} from '~/api/swap'
import { upColor, downColor } from '@/utils/constants'
const { mode } = storeToRefs(useGlobalStore())
const { t } = useGlobalStore()

const columns = computed(() => {
  return [
    {
      label: t('token'),
      prop: 'token',
      align: 'left',
      sortable: false,
    },
    {
      label: t('balance1'),
      prop: 'balance_usd',
      align: 'right',
      sortable: false,
      formatter: (row: any) => {
        return `$${formatNumber(row.balance_usd, 4)}`
      }
    },
    {
      label: t('amount'),
      prop: 'balance',
      align: 'right',
      sortable: false,
      formatter: (row: any) => {
        return `${formatNumber(row.balance, 4)}`
      }
    },
    {
      label: t('costPrice'),
      prop: 'average_purchase_price_usd',
      align: 'right',
      sortable: false,
      formatter: (row: any) => {
        return `${formatNumber(row.average_purchase_price_usd, 4)}`
      }
    },
    {
      label: t('currentPrice'),
      prop: 'current_price_usd',
      align: 'right',
      sortable: false,
      formatter: (row: any) => {
        return `${formatNumber(row.current_price_usd, 4)}`
      }
    },
    {
      label: 'PnL',
      prop: 'total_profit_ratio',
      width: 100,
      align: 'right',
      sortable: false,
      getClassName: (row: any) => Number(row.total_profit_ratio) > 0 ? `color-${upColor}` : `color-${downColor}`,
      formatter: (row: any) => {
        return `${Number(row.total_profit_ratio) > 0 ? '+' : '-'}${formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2)}`
      }
    },
  ]
})

// If you have a type for GetUserBalanceResponse, use it here. Otherwise, use any[].
const dataSource = shallowRef<GetUserBalanceResponse[]>([])

const props = defineProps({
  modelValue: Boolean,
  tableFilter: {
    type: Object,
    default: () => ({
      hide_risk: 1,
      hide_small: 0,
      user_ids: []
    })
  },
})
const emit = defineEmits(['update:modelValue', 'update:tableFilter'])

const tableParams = computed(() => {
  return {
    pageNO: 1,
    pageSize: 10,
    loaded: false,
    finished: false,
    ...props.tableFilter
  }
})
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
console.log('positions')
const fetchTable = async () => {
  try {
    const res = await getUserBalance(tableParams.value)
    console.log('fetchTable', res)
    dataSource.value = res.data
  } catch (e) {
    console.error('Error fetching user balance:', e)
    dataSource.value = []
  }
}
watch(() => dialogVisible.value, (val) => {
  if(val) fetchTable()
}, { immediate: true })
onMounted(() => {
  // fetchTable()
  console.log('mounted positionsTable')
})
</script>

<style lang="scss">
.dialog-position.el-dialog {
  --el-dialog-padding-primary: 20px;
}
</style>
<style scoped lang="scss">
/* .table-position.el-table {
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
  font-size: 14px;

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

  .table-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px 0;
    // min-height: 200px;
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
} */
</style>
