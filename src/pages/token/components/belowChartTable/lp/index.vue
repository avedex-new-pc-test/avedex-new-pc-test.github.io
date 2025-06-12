<template>
  <div class="w-lp">
    <div  class="w-[100%]">
      <div v-show="dataList.length > 0||loading" class="flex gap-10px items-center ml-12px" style="display: flex;gap: 10px;align-items: center;margin-left: 12px;">
        <div class="font-Poppins font-400 text-12px lh-16px color-[--d-999-l-666]">{{ $t('liquidity') }}</div>
        <el-radio-group class="m-radio-group" v-model="activeTime" size="small" :fill="isDark?'#333':'#666'" :text-color="isDark?'#F5F5F5':'#FFF'" @change="init1">
          <el-radio-button label="7D" :value="7" />
          <el-radio-button label="1M" :value="30" />
        </el-radio-group>
      </div>
      <Line v-if="dataList.length > 0||loading" :dataList="dataList" :loading="loading" :showSeries="showSeries"  :showLeft="showLeft" />
    </div>
    <div class="m-table mt20px" :style="{maxHeight: (dataList.length > 0||loading)?'250px':'500px'}">
      <el-table :data="dataSource" style="width: 100%" :expand-row-keys="expandedRowKeys" preserve-expanded-content fit
        :row-key="getRowKey"  :style="{height: (dataList.length > 0||loading)?'245px':'490px'}" size="small">
        <el-table-column v-for="col in columns" :key="col.prop" :label="col.label" :width="col.width" :prop="col.prop" :min-width="col.minWidth"
          :align="col.align">
          <template #default="{ row }">
            <Column :row="row" :col="col" :customKeys="['mark', 'addAmt', 'netAmt', 'txns', 'percent']">
              <div v-if="col.prop == 'mark'" class="flex-start gap-2px hover:color-[--d-FFF-l-000] cursor-pointer" @click.stop="tableRowClick(row)">
                <Icon v-if="formatLock(row)" color="#B3920E" name="material-symbols:lock" />
                <Icon v-if="row.is_contract == 1" name="iconamoon:file-document-thin"  />
                <tag v-if="Number(row?.analysis_show_creator) === 1">{{ $t('contractCreator') }}</tag>
                <el-tooltip :effect="mode" placement="top-end" :content="row?.mark||row?.address">
                  <div style="max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ col.customFormatter ? col.customFormatter(row) : row[col.prop] }}</div>
                </el-tooltip>
              </div>
              <div v-else-if="col.prop == 'addAmt'" class="flex flex-col">
                <div>
                  <span class="color-#12B886">{{ formatNumber(row.main_token_amount, 1) }}&nbsp;</span>
                  <span>{{ lpRest?.main_token_symbol }}</span>
                </div>
                <span v-if="!row.main_token_amount_usd">0</span>
                <span v-else-if="row.main_token_amount_usd == '--'">--</span>
                <span v-else>{{`${Number(row.main_token_amount_usd) > 0 ? '+$' : '-$'}${formatNumber(Math.abs(Number(row.main_token_amount_usd)), 1)}`}}</span>
              </div>
              <div v-else-if="col.prop == 'netAmt'" class="flex flex-col">
                <div>
                  <span class="color-#12B886">{{ formatNumber(row.target_token_amount, 1) }}&nbsp;</span>
                  <span>{{ lpRest?.target_token_symbol }}</span>
                </div>
                <span v-if="!row.target_token_amount_usd">0</span>
                <span v-else-if="row.target_token_amount_usd == '--'">--</span>
                <span v-else>{{`${Number(row.target_token_amount_usd) > 0 ? '+$' : '-$'}${formatNumber(Math.abs(Number(row.target_token_amount_usd)), 1)}`}}</span>
              </div>
              <div v-else-if="col.prop == 'txns'" class="flex flex-col">

                <div :class="`color-${upColor[0]} flex-start`">
                  <img src="@/assets/images/add.svg" alt="" class="h-12px w-12px mr-4px mt-2px">
                  <!-- <tag type="success" class="h-12px w-12px mr-4px">+</tag> -->
                  {{ row.add_total }}
                </div>
                <div :class="`color-${downColor[0]} flex-start`">
                  <!-- <tag type="danger" class="h-12px w-12px mr-4px">-</tag> -->
                  <img src="@/assets/images/remove.svg" alt="" class="h-12px w-12px mr-4px mt-2px">
                  {{ row.remove_total }}
                </div>
              </div>
              <div v-else-if="col.prop == 'percent'" class="flex flex-col">
                <div class="line-bar">
                  <span :style="{ width: row.percent + '%' }" />
                </div>
              </div>
            </Column>
          </template>
        </el-table-column>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table v-if="row?.lock && row?.lock.length" :data="row?.lock" style="width: 100%">
              <el-table-column v-for="col2 in columns2" :key="col2.prop" :label="col2.label" :prop="col2.prop"
                :align="col2.align">
                <template #default="{ row: row2 }">
                  <Column :row="row2" :col="col2" />
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLPHolders, getPairLiqNew } from '~/api/token'
import type {   GetLPHoldersResponse,  IHolder,  LockType,  GetPairLiqNewResponse} from '~/api/token'
import tag from './components/tag.vue'
// import type {IColumn}  from './components/columns.vue'
import { upColor, downColor } from '@/utils/constants'
import Column from './components/columns.vue'
import Line from './components/line.vue'
import type { Token } from '~/api/types/token'

const props=defineProps({
  pairAddress: {
    type: String,
    default: ''
  },
  token: {
    type: Object as PropType<Token>,
    default: () => ({})
  }
})


const {isDark,mode,showLeft,lang} = storeToRefs(useGlobalStore())
// const { token, pairAddress } = storeToRefs(useTokenStore())
const route = useRoute()
const dataSource = ref<(IHolder & { index: string })[]>([])
const dataList = ref<(GetPairLiqNewResponse & { time: string })[]>([])
const { t } = useI18n()
const lpRest = ref<any>({})
const showSeries = shallowRef([true, true])
const loading = ref(false)
const columns = computed(() => {
  return [
    {
      label: '#',
      prop: 'index',
      align: 'left',
      width: 40,
    },
    {
      label: t('provider'),
      prop: 'mark',
      align: 'left',
      sortable: false,
      minWidth: 160,
      customClassName: () => { },
      customFormatter: (row: IHolder) => {
        return row.mark ? row.mark : (row.address || '').slice(0, 2) + '...' + (row.address || '').slice(-4)
      }
    },
    {
      label: t('devote') + '%',
      prop: 'devote',
      align: 'right',
      width: 80,
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: IHolder) => {
        return formatNumber(row.percent, 1) + '%'
      }
    },
    {
      label: t('percent'),
      prop: 'percent',
      minWidth: 100,
      align: 'right',
      sortable: false,
      customClassName: () => { },
      // customFormatter: (row: IHolder) => {
      //   return `${Number(row.total_profit_ratio) > 0 ? '+' : '-'}${formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2)}%`
      // }
    },
    {
      label: lpRest.value?.main_token_symbol?(lpRest.value?.main_token_symbol+(lang.value?.indexOf('zh')>-1?'':' ')+t('amount')):'',
      prop: 'addAmt',
      align: 'right',
      minWidth: 140
    },
    {
      label: lpRest.value?.target_token_symbol?(lpRest.value?.target_token_symbol+(lang.value?.indexOf('zh')>-1?'':' ')+t('amount')):'',
      prop: 'netAmt',
      align: 'right',
      minWidth: 140
    },
    {
      label: t('amount'),
      prop: 'amount',
      align: 'right',
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: IHolder) => {
        return Array.isArray(row.lock) ? formatNumber((row.lock.reduce((prev: any, cur: any) => prev.amount || 0 + cur.amount || 0, 0)), 2) : 0
      }
    },
  
    {
      label: t('balance1'),
      prop: 'quantity',
      align: 'right',
      minWidth: 100,
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: IHolder) => {
        return `$${formatNumber(row.quantity, 4)}`
      }
    },
    // {
    //   label: t('txns'),
    //   prop: 'txns',
    //   align: 'left',
    //   width: 80,
    //   // customFormatter: (row: IHolder) => {
    //   //   return `$${formatNumber(row.current_price_usd, 4)}`
    //   // }
    // },
    // {
    //   label: t('lastTx'),
    //   prop: 'last_tx_time',
    //   align: 'right',
    //   width: 80,
    //   sortable: false,
    //   customClassName: undefined,
    //   customFormatter: (row: IHolder) => {
    //     return row?.last_tx_time?formatTimeFromNow(row?.last_tx_time) : ''
    //   }
    // },
  ]
})
const activeTime = shallowRef<7|30>(30)
const expandedRowKeys = shallowRef<string[]>([])
const columns2 = computed(() => {
  return [
    {
      label: t('amount'),
      prop: 'amount',
      align: 'center',
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: LockType) => {
        return `${formatNumber(row.amount, 2)}`
      }
    },
    {
      label: t('lockDate'),
      prop: 'lockDate',
      align: 'center',
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: LockType) => {
        return formatDate(row.lockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateStart'),
      prop: 'unlockDate',
      align: 'center',
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: LockType) => {
        return formatDate(row.unlockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateEnd'),
      prop: 'unlockDateEnd',
      align: 'center',
      sortable: false,
      customClassName: () => { },
      customFormatter: (row: LockType) => {
        return formatDate(row.vesting_end || row.unlockDate, 'YYYY-MM-DD')
      }
    },
  ]
})
onMounted(() => {
  // console.log('mounted')
  init1()
  init2()
})
onActivated(() => {
  // console.log('activated')
})
watch(() => props.pairAddress, (val) => {
  console.log('pairAddress changed', val)
  init1()
})
watch(()=>props.token, (val) => {
  console.log('token changed', val)
  init2()
})
const getRowKey = (row: any) => {
  return row.index
}
function tableRowClick(row: IHolder) {
  window.open(formatExplorerUrl(addressAndChain.value?.chain || '', row.address || '', 'address'), '_blank')
}
const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: props.token?.token || '',
    chain: props.token?.chain || ''
  }
})
function formatLock(item:any){
  return item.lock || /lock|null|(black hole)/gi.test(item.mark || '')
}
function init1() {
  if (props.pairAddress && addressAndChain.value.chain) {
    loading.value = true
    getPairLiqNew(props.pairAddress + '-' + addressAndChain.value.chain,activeTime.value).then((res: GetPairLiqNewResponse[]) => {
      dataList.value =
        res
          ?.map((i) => {
            return {
              ...i,
              time: formatDate(new Date(i?.time).getTime() / 1000, 'MM-DD')
            }
          })
          ?.reverse() || []
    }).finally(() => {
      loading.value = false
    }).catch((err: any) => {
      console.error(err)
      dataList.value = []
    })
  }
}
function init2() {
  const expandedRowKeys1 = [] as string[]
  if (props.token?.token && addressAndChain.value?.chain) {
    getLPHolders((props.token?.token || '') + ('-' + addressAndChain.value?.chain)).then((res: GetLPHoldersResponse) => {
      console.log('getLPHolders', res)
      if (res?.Holders && Array.isArray(res?.Holders)) {
        const { Holders, ...rest } = res
        dataSource.value = res.Holders.map((item: IHolder, idx: number) => ({
          ...item,
          index: (idx + 1).toString(),
        }))
        expandedRowKeys1.push(...dataSource.value.filter(item => item?.lock?.length).map(item => item.index))
        console.log('dataSource', dataSource.value)
        lpRest.value = rest
      } else {
        dataSource.value = []
        lpRest.value = {}
      }
    }).catch((err: any) => {
      console.log(err)
      dataSource.value = []
    }).finally(() => {
    })
  } else {
    dataSource.value = []
    lpRest.value = {}
  }
  expandedRowKeys.value = expandedRowKeys1
}

</script>

<style scoped lang="scss">
.m-table {
  .el-table.el-table{
    /* --el-table-header-text-color: var(--d-666-l-999); */
    --el-table-header-bg-color: var(--d-222-l-F2F2F2);
  }
  :deep() .el-table__expand-column {
    /* display: none; */
  }
  :deep() .cell{
    padding-top: 0;
    padding-bottom: 0;
  }
  :deep() .el-table__expand-icon {
    display: none;
  }
  :deep() .el-table__expanded-cell td {
    /* --el-table-row-hover-bg-color:var(--d-222-l-F2F2F2); */
    --el-table-row-hover-bg-color:var(--d-333-l-F2F2F2);
     background-color: var(--d-222-l-F2F2F2);
  }
  :deep() th {
    font-family: Poppins;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0px;
    color: var(--d-666-l-999);
  }

  :deep() td {
    font-family: Poppins;
    font-weight: 400;
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0px;
    color: var(--d-999-l-666);
    /* padding-top: 0;
    padding-bottom: 0; */
    .cell{
      line-height: 1.5;
    }
  }
}
.m-radio-group{
  :deep() .el-radio-button__inner:hover{
  }
  :deep() .el-radio-button .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner{
    border-color: var(--d-333-l-666);
  }
}
.line-bar {
  width: 100%;
  height: 3px;
  display: flex;
  background: var(--d-222-l-f5f5f5);
  border-radius: 1.5px;
  margin-top: 4px;

  >span {
    height: 3px;
    border-radius: 1.5px;
    background: var(--d-999-l-666);
  }
}
</style>
