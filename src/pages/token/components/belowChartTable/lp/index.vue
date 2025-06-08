<template>
  <div class="w-lp">
    <div class="m-table">
      <el-table :data="dataSource" style="width: 100%" :expand-row-keys="expandedRowKeys" preserve-expanded-content
        :row-key="getRowKey" height="245">
        <el-table-column v-for="col in columns" :key="col.prop" :label="col.label" :width="col.width" :prop="col.prop"
          :align="col.align">
          <template #default="{ row }">
            <Column :row="row" :col="col" :customKeys="['mark', 'addAmt', 'netAmt', 'txns','percent']">
              <div v-if="col.prop == 'mark'" class="flex flex-col">

                <!--  v-if="Number(row?.analysis_show_creator) === 1" -->
                <tag v-if="Number(row?.analysis_show_creator) === 1">{{ $t('contractCreator') }}</tag>
                {{ col.customFormatter ? col.customFormatter(row) : row[col.prop] }}
              </div>
              <div v-else-if="col.prop == 'addAmt'" class="flex flex-col">
                <div>
                  <span class="color-#12B886">{{ formatNumber(row.main_token_amount, 1) }}&nbsp;</span>
                  <span>{{ lpRest?.main_token_symbol }}</span>
                </div>
                <span>${{ formatNumber(row.main_token_amount_usd, 1) }}</span>
              </div>
              <div v-else-if="col.prop == 'netAmt'" class="flex flex-col">
                <div>
                  <span class="color-#12B886">{{ formatNumber(row.target_token_amount, 1) }}&nbsp;</span>
                  <span>{{ lpRest?.target_token_symbol }}</span>
                </div>
                <span>${{ formatNumber(row.target_token_amount_usd, 1) }}</span>
              </div>
              <div v-else-if="col.prop == 'txns'" class="flex flex-col">

                <div :class="`color-${upColor[0]} flex-end`">
                  <tag type="success" class="p-3px! h-12px w-12px mr-4px">+</tag>{{ row.add_total }}
                </div>
                <div :class="`color-${downColor[0]} flex-end`">
                  <tag type="danger" class="p-3px! h-12px w-12px mr-4px">-</tag>{{ row.add_total }}
                </div>
              </div>
              <div v-else-if="col.prop == 'percent'" class="flex flex-col">
                <div class="line-bar">
                  <span :style="{ width:row.percent+'%'}"/>
                </div>
              </div>
            </Column>
          </template>
        </el-table-column>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table v-if="row?.lock && row?.lock.length" :data="row?.lock" style="width: 100%">
              <el-table-column v-for="col2 in columns2" :key="col2.prop" :label="col2.label" :width="col2?.width"
                :prop="col2.prop" :align="col2.align">
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
import { getLPHolders, getPairLiqNew, type GetLPHoldersResponse, type IHolder } from '~/api/token'
import tag from './components/tag.vue'
// import type {IColumn}  from './components/columns.vue'
import { upColor, downColor } from '@/utils/constants'
import Column from './components/columns.vue'
const { token, pairAddress } = storeToRefs(useTokenStore())
const route = useRoute()

const dataSource = ref<(IHolder & { index: string })[]>([])
const { t } = useI18n()
const lpRest = ref<any>({})

const columns = computed(() => {
  return [
    {
      label: t('provider'),
      prop: 'mark',
      align: 'left',
      width: 78,
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return row.mark ? row.mark : (row.address || '').slice(0, 2) + '...' + (row.address || '').slice(-4)
      }
    },
    {
      label: t('devote') + '%',
      prop: 'devote',
      align: 'right',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return formatNumber(row.percent, 1) + '%'
      }
    },
    {
      label: t('addAmt'),
      prop: 'addAmt',
      align: 'right',
    },
    {
      label: t('netAmt'),
      prop: 'netAmt',
      align: 'right',
    },
    {
      label: t('amount'),
      prop: 'amount',
      align: 'right',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return Array.isArray(row.lock) ? formatNumber((row.lock.reduce((prev: any, cur: any) => prev.amount || 0 + cur.amount || 0, 0)), 2) : 0
      }
    },
    {
      label: t('percent'),
      prop: 'percent',
      width: 100,
      align: 'right',
      sortable: false,
      customClassName: (row: any) => { },
      // customFormatter: (row: any) => {
      //   return `${Number(row.total_profit_ratio) > 0 ? '+' : '-'}${formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2)}%`
      // }
    },
    {
      label: t('balance1'),
      prop: 'quantity',
      align: 'right',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return `$${formatNumber(row.quantity, 4)}`
      }
    },
    {
      label: t('txns'),
      prop: 'txns',
      align: 'right',
      // customFormatter: (row: any) => {
      //   return `$${formatNumber(row.current_price_usd, 4)}`
      // }
    },
    {
      label: t('lastTx'),
      prop: 'last_tx_time',
      align: 'right',
      sortable: false,
      customClassName: undefined,
      customFormatter: (row: any) => {
        return formatTimeFromNow(row?.last_tx_time)||''
      }
    },
  ]
})
const expandedRowKeys = shallowRef<string[]>([])
const columns2 = computed(() => {
  return [
    {
      label: t('amount'),
      prop: 'amount',
      align: 'center',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return `$${formatNumber(row.amount, 4)}`
      }
    },
    {
      label: t('lockDate'),
      prop: 'lockDate',
      align: 'center',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return formatDate(row.lockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateStart'),
      prop: 'unlockDate',
      align: 'center',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return formatDate(row.unlockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateEnd'),
      prop: 'unlockDateEnd',
      align: 'center',
      sortable: false,
      customClassName: (row: any) => { },
      customFormatter: (row: any) => {
        return formatDate(row.vesting_end || row.unlockDate, 'YYYY-MM-DD')
      }
    },
  ]
})
onMounted(() => {
  init1()
  init2()
})
watch([pairAddress], (val) => {
  console.log('pairAddress changed', val)
  init1()
})
watch([token], (val) => {
  console.log('token changed', val)
  init2()
})
const getRowKey = (row: any) => {
  return row.index
}
const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: token.value?.token || '',
    chain: token.value?.chain || ''
  }
})
function init1() {
  if (pairAddress.value && addressAndChain.value.chain) {
    getPairLiqNew(pairAddress.value + '-' + addressAndChain.value.chain).then((res: any) => {
      console.log('pairLiqNew', res)
    })
  }
}
function init2() {
  const expandedRowKeys1 = [] as string[]
  if (token?.value?.token && addressAndChain.value?.chain) {
    getLPHolders((token?.value?.token || '') + ('-' + addressAndChain.value?.chain)).then((res: GetLPHoldersResponse) => {
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
  :deep() .el-table__expand-column {
    /* display: none; */
  }

  :deep() .el-table__expand-icon {
    display: none;
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
    line-height: 20px;
    letter-spacing: 0px;
    color: var(--d-999-l-666);
  }
}
.line-bar {
  width: 100%;
  height: 3px;
  display: flex;
  background: var(--d-222-l-f5f5f5);
  border-radius: 1.5px;
  margin-top: 4px;
  > span {
    height: 3px;
    border-radius: 1.5px;
    background: var(--d-999-l-666);
  }
}
</style>
