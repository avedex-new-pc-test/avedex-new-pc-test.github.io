<template>
  <el-dialog v-model="dialogVisible" class="dialog-position" :title="$t('myPosition1')" width="680" append-to-body>
    <slot/>
    <el-table class="table-position w-100%" :data="dataSource" :height="400" @row-click="tableRowClick
  ">
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
              <div class="flex items-center gap-8px clickable flex-nowrap">
                <TokenImg :row="row" class="w-24px h-24px" />
                <el-tooltip :effect="mode" placement="top-end" :content="row?.symbol">
                  <div class="whitespace-nowrap text-ellipsis overflow-hidden max-w-100px">{{ row?.symbol }}</div>
                </el-tooltip>
              </div>
            </template>
            <span v-else-if="row[col.prop] === '--'" :class="col?.getClassName ? col.getClassName(row) : ''">--</span>
            <span v-else-if="row[col.prop] === 0" :class="col?.getClassName ? col.getClassName(row) : ''">0</span>
            <span v-else :class="col?.getClassName ? col.getClassName(row) : ''">{{ col.formatter ? col.formatter(row) :row[col.prop] }}</span>
            <!-- <Icon v-if="col?.prop === 'total_profit_ratio'" name="circum:share-1" class="text-12px ml-4px" @click.stop = "handleShare(row)"/> -->
            <div  v-if="col?.prop === 'total_profit_ratio'" class="pr-10px inline-block" >
              <share :address="row.address" :statistics="row" :chain="row.chain" type="topHolder"/>
            </div>
          </div>
        </template>
      </el-table-column>
      <template #append>
        <div
          v-infinite-scroll="fetchTable"
          class="text-0 lh-0 h-0"
          :infinite-scroll-disabled="paginationParams.loaded || paginationParams.finished"
          :infinite-scroll-distance="0"
          :infinite-scroll-delay="200"
          :infinite-scroll-immediate="true"
        />
          <div v-if="paginationParams.loaded && dataSource?.length > 0"  style="text-align: center; padding:  15px 0 10px; font-size: 12px; color: #959a9f;">{{ $t('loading') }} </div>
          <div v-else-if="paginationParams.finished && dataSource?.length > 0"  style="text-align: center; padding: 15px 0 10px; font-size: 12px; color: #959a9f;">{{ $t('noMore') }}</div>
      </template>
    </el-table>
  </el-dialog>
</template>

<script setup lang="tsx">
// import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import TokenImg from '@/components/tokenImg.vue'
import { getUserBalance ,type GetUserBalanceResponse} from '~/api/swap'
import { upColor, downColor ,defaultPaginationParams} from '@/utils/constants'
const { mode } = storeToRefs(useGlobalStore())
const { t } = useI18n()
const $router = useRouter()


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
        return `$${formatNumber(row.average_purchase_price_usd, 4)}`
      }
    },
    {
      label: t('currentPrice'),
      prop: 'current_price_usd',
      align: 'right',
      sortable: false,
      formatter: (row: any) => {
        return `$${formatNumber(row.current_price_usd, 4)}`
      }
    },
    {
      label: 'PnL',
      prop: 'total_profit_ratio',
      width: 100,
      align: 'right',
      sortable: false,
      getClassName: (row: any) => Number(row.total_profit_ratio) > 0 ? `color-${upColor[0]}` : `color-${downColor[0]}`,
      formatter: (row: any) => {
        return `${Number(row.total_profit_ratio) > 0 ? '+' : '-'}${formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2)}%`
      }
    },
  ]
})
type rowProps = GetUserBalanceResponse & { index: string }
// If you have a type for GetUserBalanceResponse, use it here. Otherwise, use any[].
const dataSource = shallowRef<(rowProps)[]>([])

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
const emit = defineEmits(['update:modelValue'])

const paginationParams = ref({...defaultPaginationParams})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
function tableRowClick(row: rowProps) {
  $router.push({
    name: 'token-id',
    params: { id: row?.index },
  })
  dialogVisible.value=false
}
const fetchTable = async () => {
  if (paginationParams.value.loaded) return
  paginationParams.value.loaded = true
  const pageNO = paginationParams.value.pageNO
  const pageSize = paginationParams.value.pageSize
  console.log('fetchTable', {pageNO,pageSize})
  getUserBalance({pageNO, pageSize,...props.tableFilter}).then(res => {
    const data=res?.data||[]
    if (Array.isArray(data) && data?.length > 0) {
      if(pageNO === 1) {
        dataSource.value = data?.map(i => ({ ...i, index: `${i.token}-${i.chain}` }))
      }else{
        dataSource.value = [...dataSource.value].concat(data.filter?.(i => dataSource.value?.every?.(j => j.index !== `${i.token}-${i.chain}`))?.map(i => ({ ...i, index: `${i.token}-${i.chain}` })))
      }
      paginationParams.value.finished = data?.length < pageSize
      if (!paginationParams.value.finished) {
        paginationParams.value.pageNO++
      }
    }else{
      if(pageNO === 1) {
        dataSource.value = []
      }
      paginationParams.value.finished = true
    }
  }).finally(() => {
   setTimeout(() => {
    paginationParams.value.loaded = false
    }, 200)
  })
}
watch(props.tableFilter, () => {
  paginationParams.value={...defaultPaginationParams}
  fetchTable()
})


watch(() => dialogVisible.value, (val) => {
  if(val){
     paginationParams.value={...defaultPaginationParams}
     fetchTable()
  }
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
.table-position.el-table{
  --el-table-tr-bg-color:transparent;
  --el-table-header-bg-color:transparent;
  --el-table-header-text-color:var(--d-999-l-666);
  --el-table-text-color:var(--d-F5F5F5-l-222);
  --el-table-border: 0.5px solid var(--d-33353D-l-F5F5F5);
  :deep() thead{
    font-size: 10px;
    tr{
      th{
        padding-top: 10px;
        padding-bottom: 10px;
        font-weight: 400;
        font-size: 12px;
        line-height: 14px;
      }
    }
  }
  :deep() .cell{
    padding: 0;
  }

}
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
