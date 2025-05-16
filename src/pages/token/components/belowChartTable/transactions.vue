<script setup lang="ts">
import TableDateFilter from './tableDateFilter.vue'
import {filterLanguage} from '~/pages/token/components/kLine/utils'
import {getPairTxs} from '~/api/token'
import {getAddressAndChainFromId} from '~/utils'

const {t} = useI18n()
const activeTab = shallowRef('all')
const {totalHolders = []} = useTokenStore()
const {getWalletAddress} = useBotStore()
const route = useRoute()
const {locale} = useLocaleStore()
const tabs = computed(() => {
  const arr: Array<{ label: string, value: string }> = []
  if (Array.isArray(totalHolders)) {
    totalHolders.forEach(i => {
      const num = i.total_address
      if (num > 0) {
        arr.push({
          ...i,
          label: i?.[filterLanguage(locale)] + (i.type !== '31' ? `(${num})` : ''),
          value: i.type
        })
      }
    })
  }
  return [{
    label: t('all'),
    value: 'all'
  },
    {
      label: t('buy3'),
      value: 'buy'
    },
    {
      label: t('sell3'),
      value: 'sell'
    },
    {
      label: t('followed'),
      value: '-100'
    },
    {
      label: t('liquidity2'),
      value: 'liquidity'
    }, ...arr]
})
const columns = computed(() => {
  return [{key: 'time', dataKey: 'time', title: t('time'), headerClass: '!overflow-visible'},
    {key: 'type', dataKey: 'type', title: t('type')},
    {key: 'swapPrice', dataKey: 'swapPrice', title: t('swapPrice')},
    {key: 'amountB', dataKey: 'amountB', title: t('amountB')},
    {key: 'amountU', dataKey: 'amountU', title: t('amountU')},
    {key: 'makers', dataKey: 'makers', title: t('makers')},
    {key: 'DEX', dataKey: 'DEX', title: 'DEX/TXN'},]
})
const transactionTableData = shallowRef([])
const tableView = ref({
  isShowDate: true
})
const tableFilterVisible = ref({
  timestamp: false
})
const tableFilter = ref({
  timestamp: []
})

onMounted(() => {
  _getPairTxs()
})
watch(() => route.params.id, () => {
  _getPairTxs()
})

async function _getPairTxs() {
  transactionTableData.value = [
    {
      'time': 1746975619,
      'id': '0000000030093136-1724',
      'chain': 'base',
      'transaction': '0xfe76e63de00defcdaab485002e9f981c275bfb1dfd816206390a244a1d80dab6',
      'amm': 'uniswapv3',
      'amount_eth': 0.00025074435223596,
      'amount_usd': 0.6234888214153085,
      'from_address': '0xd0198307160799c45e9c49b9cf88e09c0bd5dc80',
      'from_price_eth': 1.6017665346346468e-10,
      'from_price_usd': 3.9828754664114607e-7,
      'from_symbol': 'AlienPepe',
      'from_amount': 1565423.8418281928,
      'to_address': '0x4200000000000000000000000000000000000006',
      'to_price_eth': 1,
      'to_price_usd': 2486.551804080443,
      'to_symbol': 'WETH',
      'to_amount': 0.00025074435223596,
      'wallet_address': '0x4337043aedb812f09b4eb3682be2cd510d38217c',
      'newTags': null,
      'wallet_logo': {}
    }
  ]
  // try {
  //   const chain = getAddressAndChainFromId(route.params.id as string)?.chain
  //   const res = await getPairTxs(route.params.id as string, '0xb42db0711f6c04d5c55951ef2b075fbe3ec7c4d0')
  //   console.log('=>(transactions.vue:60) res', res)
  // } catch (e) {
  //   console.log('=>(transactions.vue:62) e', e)
  //
  // }
}
</script>

<template>
  <div class="transactions">
    <div class="flex items-center px-12px mb-10px">
      <a
        v-for="(item) in tabs"
        :key="item.value" href="javascript:;"
        :class="`decoration-none text-12px lh-16px pb-8px text-center color-[--d-999-l-666] px-12px py-4px rounded-4px
         ${activeTab===item.value ? 'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]':''}`"
        @click="activeTab=item.value"
      >
        {{ item.label }}
      </a>
    </div>
    <div class="text-12px">
      <AveTable
        :data="transactionTableData"
        :columns="columns"
        class="h-560px"
      >
        <template #header-time>
          <div class="flex items-center gap-2px">
            <span>{{ $t('time') }}</span>
            <Icon
              :name="`${tableView.isShowDate?'custom:calendar':'custom:countdown'}`"
              class="color-[--d-666-l-999] cursor-pointer"
              @click.self="tableView.isShowDate=!tableView.isShowDate"
            />
            <TableDateFilter
              v-model:visible="tableFilterVisible.timestamp"
              v-model:modelValue="tableFilter.timestamp"
            />
          </div>
        </template>
        <template #cell-time="{row}">
          {{ console.log("row", row) }}
        </template>
      </AveTable>
    </div>
  </div>
</template>

<style>
.transactions {
  .el-table-v2__header-wrapper, .el-table-v2__header {
    --at-apply: overflow-visible;
  }
}
</style>
