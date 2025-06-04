<script setup lang="ts">
import BigNumber from 'bignumber.js'
import {getHotTokens, type GetHotTokensResponse} from '~/api/token'
import THead from './tHead.vue'
import {formatNumber} from '~/utils/formatNumber'
import TokenImg from '~/components/tokenImg.vue'
import type {IPriceV2Response} from '~/api/types/ws'

defineProps({
  scrollbarHeight: {
    type: Number,
    required: true
  }
})
const {t} = useI18n()
onMounted(() => {
  _getHotTokens()
})

const sort = shallowRef({
  activeSort: 0,
  sortBy: '' as 'current_price_usd' | 'price_change' | 'mcap' | 'symbol'
})
const wsStore = useWSStore()
const priceV2Store = usePriceV2Store()
const listData = shallowRef<GetHotTokensResponse[]>([])
const sortedHotList = computed(() => {
  const {activeSort, sortBy} = sort.value
  if (activeSort === 0 || !sortBy) {
    return listData.value
  }
  return listData.value.toSorted((a, b) => {
    if (sortBy === 'symbol') {
      const codeB = b.symbol[0].toLowerCase().charCodeAt(0) || 0
      const codeA = a.symbol[0].toLowerCase().charCodeAt(0) || 0
      return (codeB - codeA) * activeSort
    } else if (sortBy === 'mcap') {
      return (Number(getMcap(b)) - Number(getMcap(a))) * activeSort
    } else {
      return (Number((b[sortBy!] || 0)) - Number((a[sortBy!] || 0))) * activeSort
    }
  })
})
const columns = computed(() => {
  return [{
    label: t('token') + '/' + t('mcap'),
    value: 'mcap',
    flex: 'flex-[3]',
    sort: true
  }, {
    label: t('price'),
    value: 'current_price_usd',
    flex: 'flex-1 justify-end',
    sort: true
  }, {
    label: 'Chg%',
    value: 'price_change',
    flex: 'flex-1 justify-end',
    sort: true
  }]
})

watch(() => wsStore.wsResult[WSEventType.PRICEV2], (val: IPriceV2Response) => {
  const idToPriceMap: { [key: string]: IPriceV2Response['prices'][0] } = {}
  val.prices.forEach((item) => {
    idToPriceMap[item.token + '-' + item.chain] = item
  })
  listData.value = listData.value.map(el => {
    const current = idToPriceMap[el.token + '-' + el.chain]
    if (current) {
      return {
        ...el,
        current_price_usd: current.uprice,
        price_change: current.price_change
      }
    }
    return el
  })
})

async function _getHotTokens() {
  try {
    const res = await getHotTokens()
    listData.value = res || []
    priceV2Store.setMultiPriceParams('trending', listData.value.map(el => el.token + '-' + el.chain))
    priceV2Store.sendPriceWs()
  } catch (e) {
    console.log('=>(trending.vue:15) e', e)

  }
}

function getMcap(row: GetHotTokensResponse) {
  const amount = new BigNumber(row.total).minus(row.lock_amount).minus(row.burn_amount).minus(row.other_amount)
  return amount.multipliedBy(row.current_price_usd).toString()
}
</script>

<template>
  <div class="color-[var(--d-F5F5F5-l-333)]">
    <THead
      v-model:sort="sort"
      :columns="columns"
    />
    <el-scrollbar
      :height="scrollbarHeight"
      class="[&&]:h-auto"
    >
      <NuxtLink
        v-for="(row,$index) in sortedHotList"
        :key="$index"
        class="px-10px flex items-center h-50px cursor-pointer hover:bg-[--d-1D2232-l-F5F5F5] text-12px"
        :to="`/token/${row.token}-${row.chain}`"
      >
        <div class="flex-1 flex items-center">
          <TokenImg
            :row="row"
          />
          <div class="ml-6px">
            <div class="flex">
              <span class="color-[--d-F5F5F5-l-333]">{{ row.symbol }}</span>
              <Icon
                v-if="row.risk_score > 55"
                name="custom:danger"
                class="font-14 ml-2px"/>
            </div>
            <div class="mt-2px color-[--d-999-l-666]">
              <template v-if="row.current_price_usd === 0">0</template>
              <template v-else-if="row.current_price_usd === '--'">--</template>
              <template v-else>
                {{ formatNumber(getMcap(row)) }}
              </template>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div>
            <template v-if="Number(row.current_price_usd) === 0">0</template>
            <template v-else-if="row.current_price_usd === '--'">--</template>
            <template v-else>
              ${{ formatNumber(row.current_price_usd, 2) }}
            </template>
          </div>
          <div :class="getColorClass(row.price_change)">
            <template v-if="Number(row.price_change) === 0">0</template>
            <template v-else-if="row.price_change === '--'">--</template>
            <template v-else>
              {{
                Number(row.price_change) > 0 ? '+' : '-'
              }}{{ formatNumber(Math.abs(Number(row.price_change)), 2) }}%
            </template>
          </div>
        </div>
      </NuxtLink>
    </el-scrollbar>
  </div>
</template>

<style scoped>

</style>
