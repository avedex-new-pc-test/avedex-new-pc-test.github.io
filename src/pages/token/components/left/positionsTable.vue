<script setup lang="ts">
import THead from '~/pages/token/components/left/tHead.vue'
import {getUserBalance, type GetUserBalanceResponse} from '~/api/swap'

const {t} = useI18n()
const {evmAddress, userInfo} = useBotStore()
let userIds = []
if (userInfo) {
  userIds = userInfo.addresses.map(({address, chain}) => address + '-' + chain)
}
const tableFilter = shallowRef({
  hide_risk: 0,
  hide_small: 0,
  user_ids: userIds
})
const loadingSwap = shallowRef<{ [key: number]: boolean }>({})
const props = defineProps({
  height: [Number, String]
})
const scrollbarHeight = computed(() => {
  return Number(props.height) - 110
})
const sort = shallowRef({
  sortBy: undefined,
  activeSort: 0
})
const map: { [key: number]: string } = {
  '-1': 'desc',
  1: 'asc'
}
const backendSort = computed(() => {
  const backActiveSort = map[sort.value.activeSort]
  return {
    sort_dir: backActiveSort,
    sort: sort.value.sortBy
  }
})
const columns = computed(() => {
  return [{
    label: `${t('token')}/${t('balance1')}`,
    value: 'balance_usd',
    flex: 'flex-[1.5]',
    sort: true
  }, {
    label: t('profit2'),
    value: 'total_profit',
    flex: 'flex-1 justify-end',
    sort: true
  }, {
    label: '',
    value: '',
    flex: 'flex-1 justify-end',
    sort: false
  }]
})
const listStatus = shallowRef({
  finished: false,
  loading: false,
  pageNo: 1,
  pageSize: 10
})
const listData = shallowRef<(GetUserBalanceResponse & { index: string })[]>([])

onMounted(() => {
  _getUserBalance()
})
watch(() => backendSort, () => {
  _getUserBalance()
})

async function _getUserBalance() {
  try {
    listStatus.value.loading = true
    const pageNo = listStatus.value.pageNo
    const res = await getUserBalance({
      pageNO: listStatus.value.pageNo,
      pageSize: listStatus.value.pageSize,
      ...tableFilter.value,
      ...backendSort.value,
    })
    if (Array.isArray(res?.data) && res.data.length > 0) {
      if (pageNo === 1) {
        listData.value = res.data.map(i => ({...i, index: `${i.token}-${i.chain}`}))
      } else {
        listData.value = res.data
          .filter(i => listData.value.every(j => j.index !== `${i.token}-${i.chain}`))
          .map(i => ({
            ...i,
            index: `${i.token}-${i.chain}`
          }))
      }
      listStatus.value.finished = res.data.length < listStatus.value.pageSize
      if (!listStatus.value.finished) {
        listStatus.value.pageNo++
      }
    } else {
      if (listStatus.value.pageNo === 1) {
        listData.value = []
      }
    }
  } catch (e) {
    console.log('=>(favoriteTable.vue:106) (e)', (e))
  } finally {
    listStatus.value.loading = false
  }
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

function handleSellAmount(row) {

}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mt-10px pr-15px">
      <el-checkbox
        v-model="tableFilter['hide_risk']"
        class="ml-12px"
        :style="{
          marginRight:0
        }"
        size="small" :true-value="1" :false-value="0"
      >
        {{ $t('hideRiskTokenShort') }}
      </el-checkbox>
      <el-checkbox
        v-model="tableFilter['hide_small']"
        size="small" :true-value="1" :false-value="0"
      >
        {{ $t('hideSmallAssets1') + '<1USD' }}
      </el-checkbox>
      <NetSelect
        v-if="evmAddress"
        v-model:userIds="tableFilter.user_ids"
        @update:user-ids="_getUserBalance"
      />
    </div>
    <t-head
      v-model:sort="sort"
      :columns="columns"
    />
    <el-scrollbar
      ref="otherListArea"
      :height="scrollbarHeight"
    >
      <div
        :infinite-scroll-disabled="listStatus.finished"
        infinite-scroll-distance="200"
        :infinite-scroll-delay="10"
        :infinite-scroll-immediate="false"
      >
        <div v-loading="listStatus.loading && listStatus.pageNo===1" class="px-10px pb-20px">
          <div v-for="(row,$index) in listData" :key="$index" class="text-12px flex justify-between py-10px min-h-35px">
            <div class="flex-[1.5] flex items-center">
              <TokenImg
                :row="row"
              />
              <div class="ml-6px">
                <div class="flex">
                  <span class="color-[var(--d-F5F5F5-l-333)]">{{ row.symbol }}</span>
                  <Icon
                    v-if="row.risk_score > 55 || row.risk_level < 0"
                    name="custom:danger"
                    class="font-14 ml-2px"/>
                </div>
                <div class="mt-2px color-[var(--d-999-l-666)]">
                  <template v-if="row.balance === 0">0</template>
                  <template v-else-if="row.balance === '--'">--</template>
                  <template v-else>
                    {{ formatNumber(row.balance, 2) }}({{
                      '$' + formatNumber(row.balance_usd ||
                        0, 2)
                    }})
                  </template>
                </div>
              </div>
            </div>
            <div class="flex-1 flex flex-col items-end">
              <div :class="getColor(Number(row.total_profit))">
                <template v-if="Number(row.total_profit) === 0">0</template>
                <template v-else-if="row.total_profit === '--'">--</template>
                <template v-else>
                  {{ Number(row.total_profit) > 0 ? '$' : '-$' }}{{
                    formatNumber(Math.abs(Number(row.total_profit)), 2)
                  }}
                </template>
              </div>
              <div :class="getColor(Number(row.total_profit_ratio))">
                <template v-if="Number(row.total_profit_ratio) === 0">0</template>
                <template v-else-if="row.total_profit_ratio === '--'">--</template>
                <template v-else>
                  {{
                    Number(row.total_profit_ratio) > 0 ? '+' : '-'
                  }}{{ formatNumber(Math.abs(Number(row.total_profit_ratio) * 100), 2) }}%
                </template>
              </div>
            </div>
            <div class="flex-1 flex justify-end">
              <el-button
                v-if="evmAddress && row.token!=='0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'"
                :loading="loadingSwap[row.index]"
                @click="handleSellAmount(row)"
              >
                {{ $t('sellAll') }}
              </el-button>
              <span v-else class="color-[var(--d-EAECEF-l-333)]">--</span>
            </div>
          </div>
        </div>
        <div
          v-show="listStatus.loading && listStatus.pageNo!==1"
          class="color-#959a9f text-12px text-center">
          {{ $t('loading') }}
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>

</style>
