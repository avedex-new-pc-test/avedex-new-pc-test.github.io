<script setup lang="ts">
import {type GetHomePumpListResponse, homePumpList} from '~/api/token'
import THead from './tHead.vue'
import {formatNumber} from '~/utils/formatNumber'
import TokenImg from '~/components/tokenImg.vue'
import dayjs from 'dayjs'

defineProps({
  scrollbarHeight: {
    type: Number,
    required: true
  }
})
const {t} = useI18n()
// const tokenStore = useTokenStore()
const sort = ref({
  sortBy: undefined,
  activeSort: 0
})
const isVolUSDT = ref(true)
const tabList = computed(()=>{
  return [{
    label: t('NewPairs'),
    value: 'pump_in_new',
    progressVisible: true
  }, {
    label: t('FinalStretch'),
    value: 'pump_in_almost',
    progressVisible: true
  }, {
    label: t('Migrated'),
    value: 'pump_out_new',
    progressVisible: false
  }, {
    label: t('HotMigrated'),
    value: 'pump_out_hot',
    progressVisible: false
  }]
})
const activeTab = ref('pump_in_new')
const progressVisible = computed(() => {
  return tabList.value.find(el => el.value === activeTab.value)?.progressVisible
})
const query = ref({
  pageNO: 1,
  pageSize: 20
})
const listStatus = ref({
  finished: false,
  loading: false,
  error: false
})
const listData = shallowRef<GetHomePumpListResponse[]>([])
const columns = computed(() => {
  return [{
    label: t('token') + '/' + t('progress'),
    value: 'progress',
    flex: 'flex-1',
    sort: true
  }, {
    label: '',
    value: 'current_price_usd',
    flex: 'w-92px justify-end',
    sort: false
  }, {
    label: t('mCap'),
    value: 'market_cap',
    flex: 'w-70px justify-end',
    sort: true
  }]
})

onMounted(() => {
  _getHomePumpList()
})

const tabsContainer = ref<HTMLElement | null>(null)
function setActiveTab(tab: any,index:number) {
  activeTab.value = tab
  resetListStatus()
  _getHomePumpList()
  scrollTabToCenter(tabsContainer,index)
}

function sortChange() {
  resetListStatus()
  _getHomePumpList()
}

function resetListStatus() {
  query.value.pageNO = 1
  listStatus.value.finished = false
  listStatus.value.error = false
}

async function _getHomePumpList() {
  try {
    listStatus.value.loading = true
    const res = await homePumpList({
      chain: 'solana',
      category: activeTab.value,
      ...query.value,
      sort: sort.value.sortBy,
      sort_dir: ({
        1: 'asc',
        '-1': 'desc'
      })[sort.value.activeSort]
    })
    const {pageNO} = query.value
    if (Array.isArray(res?.data)) {
      const formatedDate = formatData(res?.data || [])
      if (pageNO === 1) {
        listData.value = formatedDate
      } else {
        listData.value = listData.value.concat(formatedDate)
      }
      listStatus.value.finished = res?.data.length < query.value.pageSize
      if (!listStatus.value.finished) {
        query.value.pageNO++
      }
    }
  } catch (e) {
    console.log('=>(pump.vue:28) e', e)
  } finally {
    listStatus.value.loading = true
  }
}

function formatData() {

}
</script>

<template>
  <div v-loading="listStatus.loading && query.pageNO===1&&listData.length===0">
    <div
      ref="tabsContainer"
      class="mt-12px  mx-12px mb-16px flex items-center gap-10px whitespace-nowrap scrollbar-hide overflow-x-auto overflow-y-hidden">
        <span
          v-for="(item,index) in tabList"
          :key="index"
          :class="`decoration-none shrink-0 text-12px lh-16px text-center color-[--d-999-l-666] px-4px py-2px rounded-4px cursor-pointer ${activeTab===item.value?'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]' : ''}`"
          @click="setActiveTab(item.value,index)"
        >
        {{ item.label }}
        </span>
    </div>
    <THead
      v-model:sort="sort"
      :columns="columns"
      @update:sort="sortChange"
    >
    <template #current_price_usd>
      {{ t('amountB') }}
      <Icon
        name="custom:price"
        :class="`ml-2px mr-2px cursor-pointer text-10px ${isVolUSDT?'color-[--d-F5F5F5-l-222]':'color-#666'}`"
        @click.stop.self="isVolUSDT=!isVolUSDT"
      />
      /{{ t('Txs') }}
    </template>
    </THead>
    <el-scrollbar
      :height="scrollbarHeight"
      class="[&&]:h-auto"
    >
      <NuxtLink
        v-for="(row,$index) in listData"
        :key="$index"
        class="px-10px flex items-center h-50px cursor-pointer hover:bg-[--d-333-l-F5F5F5] text-12px"
        :to="`/token/${row.token0_address}-${row.chain}`"
      >
        <div class="flex-[2] flex items-center">
          <TokenImg
            :row="{
            chain:row.chain,
            logo_url:row.token0_logo_url
          }"
          />
          <div class="ml-6px">
            <div class="flex">
              <span class="color-[--d-F5F5F5-l-333]">{{ row.token0_symbol }}</span>
            </div>
            <div class="mt-2px color-[--d-999-l-666] text-10px">
              <TimerCount
                v-if="row.created_at && Number(formatTimeFromNow(dayjs(row.created_at).unix(),true)) < 60"
                :key="dayjs(row.created_at).unix()"
                :timestamp="dayjs(row.created_at).unix()"
                :end-time="60"
              >
                <template #default="{seconds}">
              <span class="color-[--d-999-l-666]">
                <template v-if="seconds<60">
                  {{ seconds }}{{ $t('ss') }}
                </template>
                <template v-else>
                  {{ dayjs(row.created_at).fromNow() }}
                </template>
              </span>
                </template>
              </TimerCount>
              <span v-else class="color-[--d-999-l-666]">
                {{ dayjs(row.created_at).fromNow()}}
              </span>
              <span
                v-if="progressVisible"
                class="color-[--d-999-l-666] ml-8px"
              >
              {{ formatNumber(row.progress, 1) }}%
              </span>
            </div>
          </div>
        </div>
        <div class="w-92px flex-col flex items-end">
          <span>{{ isVolUSDT ? '$' : '' }}{{
              isVolUSDT ? formatNumber(row.volume_u_24h, 2) : formatNumber(row.volume_u_24h / row.current_price_usd, 2)
            }}</span>
          <span class="color-[--d-666-l-999]">{{ formatNumber(row.tx_24h_count) }}</span>
        </div>
        <div class="w-70px flex-col flex items-end">
          <span>${{ formatNumber(row.market_cap, 2) }}</span>
          <span :class="getColorClass(row.price_change_24h)">{{ formatNumber(row.price_change_24h, 1) }}%</span>
        </div>
      </NuxtLink>
    </el-scrollbar>
  </div>
</template>

<style scoped>

</style>
