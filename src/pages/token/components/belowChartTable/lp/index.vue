<template>
  <div class="w-lp">
    <div class="m-table">
      <el-table :data="dataSource" style="width: 100%" :expand-row-keys="expandedRowKeys" preserve-expanded-content :row-key="getRowKey" height="245">
        <el-table-column v-for="col in columns" :key="col.prop" :label="col.label" :width="col.width" :prop="col.prop"
          :align="col.align">
          <template #default="{ row }">
            <div>
              <span v-if="col.prop == 'mark'" :class="col?.getClassName ? col.getClassName(row) : ''">
                <!--  v-if="Number(row?.analysis_show_creator) === 1" -->
                <tag>{{ $t('contractCreator') }}</tag>
                {{ col.formatter ? col.formatter(row):row[col.prop] }}
              </span>
              <span v-else-if="row[col.prop] === '--'" :class="col?.getClassName ? col?.getClassName(row) : ''">--</span>
              <span v-else-if="row[col.prop] === 0" :class="col?.getClassName ? col.getClassName(row) : ''">0</span>
              <span v-else :class="col?.getClassName ? col.getClassName(row) : ''">{{ col.formatter ? col.formatter(row)
                :row[col.prop] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table v-if="row?.lock&&row?.lock.length" :data="row?.lock" style="width: 100%">
              <el-table-column v-for="col2 in columns2" :key="col2.prop" :label="col2.label" :width="col2?.width" :prop="col2.prop" :align="col2.align">
                <template #default="{ row:row2 }">
                  <span v-if="row2[col2.prop] === '--'" :class="col2?.getClassName ? col2.getClassName(row2) : ''">--</span>
                  <span v-else-if="row2[col2.prop] === 0" :class="col2?.getClassName ? col2.getClassName(row2) : ''">0</span>
                  <span v-else :class="col2?.getClassName ? col2.getClassName(row2) : ''">{{ col2.formatter ? col2.formatter(row2)
                    :row2[col2.prop] }}</span>
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
const { token, pairAddress } = storeToRefs(useTokenStore())
const route = useRoute()

const dataSource = ref<(IHolder & { index: string })[]>([])
const { t } = useI18n()
const columns = computed(() => {
  return [
    {
      label: t('provider'),
      prop: 'mark',
      align: 'left',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
        return row.mark?row.mark:(row.address || '').slice(0, 2) + '...' + (row.address || '').slice(-4)
      }
    },
    {
      label: t('devote'),
      prop: 'quantity',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      // formatter: (row: any) => {
      //   return row.quantity
      // }
    },
    {
      label: t('addAmt'),
      prop: 'quantity',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      // formatter: (row: any) => {
      //   return row.quantity
      // }
    },
    {
      label: t('netAmt'),
      prop: 'quantity',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      // formatter: (row: any) => {
      //  return row.quantity
      // }
    },
    {
      label: t('amount'),
      prop: 'target_token_amount',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
        return `$${formatNumber(row.current_price_usd, 4)}`
      }
    },
    {
      label: t('percent'),
      prop: 'percent',
      width: 100,
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      // formatter: (row: any) => {
      //   return `${Number(row.total_profit_ratio) > 0 ? '+' : '-'}${formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2)}%`
      // }
    },
    {
      label: t('balance1'),
      prop: 'current_price_usd',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
        return `$${formatNumber(row.current_price_usd, 4)}`
      }
    },
    {
      label: t('txns'),
      prop: 'txns',
      align: 'right',
      sortable: false,
      getClassName: (row: any) => { },
      // formatter: (row: any) => {
      //   return `$${formatNumber(row.current_price_usd, 4)}`
      // }
    },
    {
      label: t('lastTx'),
      prop: 'last_tx_time',
      align: 'right',
      sortable: false,
      getClassName: undefined,
      formatter: (row: any) => {
        return formatTimeFromNow(row?.last_tx_time)
      }
    },
  ]
})
const expandedRowKeys=shallowRef<string[]>([])
const columns2 = computed(() => {
  return [
    {
      label: t('amount'),
      prop: 'amount',
      align: 'center',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
        return `$${formatNumber(row.amount, 4)}`
      }
    },
    {
      label: t('lockDate'),
      prop: 'lockDate',
      align: 'center',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
        return formatDate(row.lockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateStart'),
      prop: 'unlockDate',
      align: 'center',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
       return formatDate(row.unlockDate, 'YYYY-MM-DD')
      }
    },
    {
      label: t('unlockDateEnd'),
      prop: 'unlockDateEnd',
      align: 'center',
      sortable: false,
      getClassName: (row: any) => { },
      formatter: (row: any) => {
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
  if (pairAddress.value&&addressAndChain.value.chain) {
    getPairLiqNew(pairAddress.value + '-' + addressAndChain.value.chain).then((res: any) => {
      console.log('pairLiqNew', res)
    })
  }
}
function init2() {
  const expandedRowKeys1=[] as string[]
  if (token?.value?.token && addressAndChain.value?.chain) {
    getLPHolders((token?.value?.token || '') + ('-' + addressAndChain.value?.chain)).then((res: GetLPHoldersResponse) => {
      console.log('getLPHolders', res)
      if (res?.Holders && Array.isArray(res?.Holders)) {
        dataSource.value = res.Holders.map((item: IHolder, idx: number) => ({
          ...item,
          index: (idx + 1).toString(),
        }))
        expandedRowKeys1.push(...dataSource.value.filter(item => item?.lock?.length).map(item => item.index))
        console.log('dataSource', dataSource.value)
      } else {
        dataSource.value = []
      }
    }).catch((err: any) => {
      console.log(err)
      dataSource.value = []
    }).finally(() => {
    })
  }else{
    dataSource.value = []
  }
  expandedRowKeys.value=expandedRowKeys1
}

</script>

<style scoped lang="scss">
.m-table{
  :deep() .el-table__expand-column{
    /* display: none; */
  }
  :deep() .el-table__expand-icon{
    display: none;
  }
}
</style>
