<template>
  <div class="holderInfo">
    <div class="px-12px mb-10px flex justify-between">
      <div
        class="flex items-center whitespace-nowrap w-[80%] overflow-x-auto scrollbar-hide"
      >
        <a
          v-for="item in tabs"
          :key="item.value"
          href="javascript:;"
          :class="`decoration-none shrink-0 text-12px lh-16px text-center color-[--d-999-l-666] px-12px py-4px rounded-4px
         ${
           activeTab === item.value
             ? 'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]'
             : ''
         }`"
          @click="setActiveTab(item.value)"
        >
          {{ item.label }}
        </a>
      </div>
    </div>
    <ul v-show="!['all']?.includes?.(activeTab)" class="section-4">
      <li>
        <div>{{ $t('balance1') }}</div>
        <div :class="!Number(aggregateStats?.balance || 0) ? 'color-text-2' : ''">
          ${{ formatNumber((aggregateStats?.balance || 0) * (price || 0), 2) }}
        </div>
      </li>
      <li>
        <div>{{ $t('amount') }}/{{ $t('largestPosition') }}</div>
        <div>
          <span :class="!Number(aggregateStats?.balance || 0) ? 'color-text-2' : ''">
            {{ formatNumber(aggregateStats?.balance || 0, 2) }}
          </span>
          <span class="color-text-2">/</span>
          <span :class="!Number(aggregateStats?.largestPosition || 0) ? 'color-text-2' : ''">
            {{ formatNumber(aggregateStats?.largestPosition || 0, 2) }}
          </span>
        </div>
        <div class="line-bar">
          <span
            :style="{
              width:
                ((aggregateStats?.balance || 0) * 100) / (aggregateStats?.largestPosition || 1) +
                '%'
            }"
          ></span>
        </div>
      </li>
      <li>
        <div>{{ $t('buy') }}/{{ $t('sell') }}</div>
        <div>
          <span :class="!Number(aggregateStats?.buy || 0) ? 'color-text-2' : 'color-#12B886'">
            ${{ formatNumber(aggregateStats?.buy || 0, 2) }}
          </span>
          <span class="color-text-2">/</span>
          <span :class="!Number(aggregateStats?.sell || 0) ? 'color-text-2' : 'color-#F6465D'">
            ${{ formatNumber(aggregateStats?.sell || 0, 2) }}
          </span>
        </div>
      </li>
      <li>
        <div>{{ $t('soldAll') }}/{{ $t('all') }}</div>
        <div>
          <span
            :class="
              !Number( aggregateStats?.soldAll || 0)
                ? 'color-text-2'
                : ''
            "
          >
            {{
              formatNumber(aggregateStats?.soldAll || 0, 2)
            }}
          </span>
          <span class="color-text-2">/</span>
          <span
            :class="
              !Number(aggregateStats?.all || 0)
                ? 'color-text-2'
                : ''
            "
          >
            {{ formatNumber(aggregateStats?.all || 0, 2) }}
          </span>
        </div>
      </li>
      <li>
        <div>{{ $t('totalPnL') }}</div>
        <div
          :class="
            !Number(totalProfit || 0)
              ? 'color-text-2'
              : Number(totalProfit || 0) > 0
              ? 'color-#12B886'
              : 'color-#F6465D'
          "
        >
          {{ !Number(totalProfit || 0) ? '' : Number(totalProfit || 0) > 0 ? '+' : '-' }}${{
            formatNumber(totalProfit || 0, 2)?.replace('-', '')
          }}
        </div>
      </li>
    </ul>
    <List ref="holdersRef" :tableList="holderList"  :loading="loadingHolders" :tabActive="activeTab" @handleSortChange="handleSortChange"/>
  </div>
</template>

<script setup lang="ts">
import { filterLanguage } from '~/pages/token/components/kLine/utils'
import BigNumber from 'bignumber.js'
import {
  _getTop100range,
  _getHoldersList,
  type AggregateStats,
  type HolderStat,
} from '@/api/holders'
import { useLocalStorage } from '@vueuse/core'
import List from './list'
const holderListSortObj = useLocalStorage('holderListSortObj', {
  all: {
    sort_by: '',
    order: '',
  },
  buy: {
    sort_by: 'bought_usd',
    order: 'desc',
  },
  sell: {
    sort_by: 'sold_usd',
    order: 'desc',
  },
})
const { price } = storeToRefs(useTokenStore())
const route = useRoute()
const botStore = useBotStore()
const { t } = useI18n()
const { totalHolders } = storeToRefs(useTokenStore())
const activeTab = shallowRef<string>('all')

const searchKeyword = shallowRef('')
const loadingHolders = shallowRef(false)

const holderListObj = ref<Record<string, HolderStat[]>>({})
const aggregateStatsObj = ref<Record<string, AggregateStats>>({})

const tabs = computed(() => {
  const arr: Array<{ label: string; value: string }> = []
  if (Array.isArray(totalHolders.value)) {
    totalHolders.value.forEach((i) => {
      const num = i.total_address
      if (num > 0) {
        arr.push({
          ...i,
          label: i?.[filterLanguage(useLocaleStore().locale)] + `(${num})`,
          value: i.type,
        })
      }
    })
  }
  return [
    {
      label: t('all'),
      value: 'all',
    },
    {
      label: t('topGainer'),
      value: 'sell',
    },
    {
      label: t('topLoser'),
      value: 'buy',
    },
    {
      label: t('24hBuyers'),
      value: 'buy24h',
    },
    {
      label: t('24hSellers'),
      value: 'sell24h',
    },
    ...arr,
  ]
})
const id = computed(() => route.params.id as string)
const holderList = computed(() => {
      // if (this.searchKeyword) {
      //   return this.filterList || []
      // }
      const list = holderListObj?.value?.[activeTab.value] || []
      // list = list?.map(i => {
      //   if (
      //     this.$store.state.token_user?.remark &&
      //     i.holder === this.$store.state.token_user?.address
      //   ) {
      //     i.remark = this.$store.state.token_user?.remark
      //   }
      //   return i
      // })
      // if (this.searchOriginKeyword) {
      //   if (this.searchOriginType == 'sol') {
      //     return list?.filter(i => i.sol_first_transfer_in_from == this.searchOriginKeyword) || []
      //   } else {
      //     console.log('------------111-----', this.filterList)
      //     return list?.filter(i => i.token_first_transfer_in_from == this.searchOriginKeyword) || []
      //   }
      // }
      return list || []
})
const aggregateStats = computed(() => aggregateStatsObj?.value?.[activeTab.value] || {})
const totalProfit = computed(() => {
  return holderList.value
        ?.reduce((p, row) => {
          const amount = Math.max((row?.bought || 0) - (row?.sold || 0), 0)
          const c = new BigNumber(price?.value || 0 - (row?.avg_purchase_price || 0)).times(amount)
          return c.plus(p)
        }, new BigNumber('0'))
        ?.toFixed(0)
    })


watch(
  () => id.value,
  (newId) => {
    if (newId) {
      getHoldersList()
    }
  },
  {
    immediate: true,
  }
)

watch(activeTab, (val) => {
  // if (searchKeyword) {
  //   this.filterAddress(this.searchKeyword)
  // }
  // if (val === 'buy' || val === 'sell') {
  //   let prop = val === 'buy' ? 'ascending' : 'descending'
  //   this.$refs.holdersRef.sort('total_profit', prop)
  // } else if (val === 'buy24h' || val === 'sell24h') {
  //   let prop = val === 'buy24h' ? 'bought_usd' : 'sold_usd'
  //   this.$refs.holdersRef.sort(prop, 'descending')
  // } else {
  //   let sort = this.holderListSortObj?.[val] || {}
  //   if (sort.sort_by && sort.order) {
  //     this.$refs.holdersRef.sort(sort.sort_by, sort.order + 'ending')
  //   } else {
  //     this.$refs.holdersRef.clearSort()
  //     this.getHoldersList()
  //   }
  // }
  getHoldersList()
})
function setActiveTab(val: string) {
  activeTab.value = val
}
function getHoldersList(sortObj?: { sort_by: string; order: string }) {
  let tag_type: string = ''
  if (
    !['all', 'buy', 'sell', 'buy24h', 'sell24h'].some(
      (i) => activeTab.value === i
    )
  ) {
    tag_type = activeTab.value
  }
  const sort = {
    sort_by: sortObj?.sort_by,
    order: sortObj?.order,
  }
  if (!sort.sort_by) {
    if (activeTab.value === 'buy') {
      sort.order = 'asc'
      sort.sort_by = 'total_profit'
    } else if (activeTab.value === 'sell') {
      sort.order = 'desc'
      sort.sort_by = 'total_profit'
    } else if (activeTab.value === 'buy24h') {
      sort.order = 'desc'
      sort.sort_by = 'bought_usd'
    } else if (activeTab.value === 'sell24h') {
      sort.order = 'desc'
      sort.sort_by = 'sold_usd'
    }
  }
  const params = {
    token_id: id.value,
    tag_type: tag_type,
    self_address: botStore.evmAddress,
    ...sort,
    recent:
      activeTab.value === 'buy24h' || activeTab.value === 'sell24h'
        ? 1
        : undefined,
  }
  holderListSortObj.value[activeTab.value] = sort
  if (searchKeyword.value) {
    return
  }
  loadingHolders.value = true
  _getHoldersList(params)
    .then((res) => {
      console.log('--------------------res-----------------------------', res)
      holderListObj.value[activeTab.value] = res?.holderStats || []
      aggregateStatsObj.value[activeTab.value] = res?.aggregateStats || {}
    })
    .catch(() => {
      holderListSortObj.value[activeTab.value] = []
    })
    .finally(() => {
      loadingHolders.value = false
    })
}
function handleSortChange(obj:{ prop: string, order:string }) {
    getHoldersList({ sort_by: obj.prop, order: obj.order?.replace('ending', '') })
}
</script>
<style lang="scss" scoped>
.section-4 {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: #15171C;
  background: var(--a-btn-bg-1-color);
  border-radius: 4px;
  padding: 10px 30px;
  li {
    // flex: 1;
    text-align: center;
    > :first-child {
      font-size: 12px;
      color: #959a9f;
      letter-spacing: 0;
      font-weight: 400;
    }
    > :nth-child(2) {
      font-size: 13px;
      color: var(--a-text-1-color);
      letter-spacing: 0;
      line-height: 18px;
      font-weight: 400;
      margin-top: 5px;
    }
    .color-text-2 {
      color: #959a9f;
    }
    .color-\#12B886 {
      color: #12b886;
    }
    .color-\#F6465D {
      color: #f6465d;
    }
  }
}
</style>
