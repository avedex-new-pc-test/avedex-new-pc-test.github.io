<script setup lang="ts">
import BigNumber from 'bignumber.js'
import {getHotTokens, type GetHotTokensResponse} from '~/api/token'
import THead from './tHead.vue'
import {formatNumber} from '~/utils/formatNumber'
import TokenImg from '~/components/tokenImg.vue'

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
  sortBy: ''
})
const listData = shallowRef<GetHotTokensResponse[]>([])
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

async function _getHotTokens() {
  try {
    const res = await getHotTokens()
    listData.value = res || []
  } catch (e) {
    console.log('=>(trending.vue:15) e', e)

  }
}

function getMcap(row: GetHotTokensResponse) {
  const amount = new BigNumber(row.total).minus(row.lock_amount).minus(row.burn_amount).minus(row.other_amount)
  return formatNumber(amount.multipliedBy(row.current_price_usd).toString(), 1)
}

function getColor(val: number) {
  if (val === 0 || isNaN(val)) {
    return 'color-#959a9f'
  } else if (val > 0) {
    return 'color-#12B886'
  } else {
    return 'color-#F6465D'
  }
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
        v-for="(row,$index) in listData"
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
                {{ getMcap(row) }}
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
          <div :class="getColor(Number(row.price_change))">
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
