<template>
  <div class="holderInfoOld px-12px">
    <el-row :gutter="10">
      <el-col :span="24">
        <div class="title text-12px color-[--d-FFF-l-000]">
          {{ $t('holdersDetail') }}
          <span class="color-#848E9C">({{ $t('excludeNullAndPoll') }})</span>
        </div>
        <div class="checkbox-container checkbox-old mt-10px">
          <el-checkbox v-model="checked[0]" class="checkbox-FFCC00">
            {{ $t('topN', { n: 10 }) }}
          </el-checkbox>
          <el-checkbox v-model="checked[1]" class="checkbox-FFB6300">
            {{ $t('topN', { n: 100 }) }}
          </el-checkbox>
          <el-checkbox
            v-for="(item, index) in supportTags"
            :key="index"
            v-model="checked[index + 2]"
            shape="square"
            :checked-color="item.color"
            :class="`checkbox-${item?.color?.replace('#', '')}`"
          >
            {{ item?.[filterLanguage(language)] }}
          </el-checkbox>
        </div>
        <LineChart
          :dataList="top100range"
          :showSeries="checked"
          :loading="loadingTop100Range"
          chartHeight="162px"
        />
      </el-col>
      <el-col :span="24">
        <div class="title flex items-center justify-between mt-17px">
          <span class="text-12px color-[--d-FFF-l-000]">{{
            $t('mainChip')
          }}</span>
          <div class="tabs">
            <template v-for="(item, index) in tabs" :key="index">
              <span
                class="tab-item"
                :class="{ active: item.type == tabActive }"
                @click.stop.prevent="switchTabs(item)"
              >
                {{ item?.[filterLanguage(language)] }}
                <template v-if="item?.total_address !== undefined">
                  ({{ formatNumber(item?.total_address || 0, 0) }})
                </template>
              </span>
            </template>
          </div>
        </div>
        <el-scrollbar :height="355">
          <el-table
            v-show="tabActive == '100'"
            ref="tableRef"
            v-loading="loadingTop100Balance"
            class="mt-15px"
            cell-class-name="color-[--d-999-l-959A9F] text-12px"
            :data="top100balanceC"
            fit
            :height="355"
            style="width: 100%"
            @row-click="goLink"
          >
            <template #empty>
              <div
                v-if="!loadingTop100Balance"
                class="flex flex-col items-center justify-center py-30px"
              >
                <img
                  v-if="mode === 'light'"
                  src="@/assets/images/empty-white.svg"
                />
                <img
                  v-if="mode === 'dark'"
                  src="@/assets/images/empty-black.svg"
                />
                <span>{{ t('emptyNoData') }}</span>
              </div>
              <span v-else />
            </template>
            <el-table-column type="index" label="#" width="40" />
            <el-table-column :label="$t('ratio')" prop="time" align="right">
              <template #default="{ row }">
                {{ formatProportion(row) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('position')" prop="time" align="right">
              <template #default="{ row }">
                {{ formatNumber(row?.amount_cur, 2) }}
              </template>
            </el-table-column>

            <el-table-column :label="$t('Change3D')" prop="time" align="right">
              <template #default="{ row }">
                <span
                  :style="{
                    color:
                      row.amount_diff_3days > 0 ? upColor[0] : downColor[0],
                  }"
                >
                  {{ formatNumber(row?.amount_diff_3days, 2) }}
                </span>
              </template>
            </el-table-column>

            <el-table-column
              :label="$t('profit1') + '($)'"
              prop="time"
              align="right"
            >
              <template #default="{ row }">
                <span
                  :style="{
                    color: formatProfit(row) > 0 ? upColor[0] : downColor[0],
                  }"
                >
                  {{ formatNumber(formatProfit(row), 2) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column :label="$t('address')" align="right">
              <template #default="{ row }">
                <div class="flex-end">
                  <SignalTags
                    :tags="row.newTags"
                    :walletAddress="row.address"
                    :chain="row.chain"
                  />
                  <span class="ml-3px"> *{{ row.address?.slice(-6) }}</span>
                  <Icon
                    name="custom:filter"
                    class="color-[--d-666-l-999] cursor-pointer text-10px ml-3px"
                    @click="handlerDialogProfitLoss(row)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>

          <Insiders
            v-show="tabActive !== '100'"
            :insidersObj="insidersObj"
            :type="tabActive"
          />
        </el-scrollbar>
      </el-col>
    </el-row>
    <ProfitLoss ref="profitLossRef1" v-model="dialogProfitLoss"/>
  </div>
</template>

<script setup lang="ts">
import { filterLanguage } from '~/pages/token/components/kLine/utils'
import { getAddressAndChainFromId } from '@/utils/index'
import { upColor, downColor } from '@/utils/constants'
import { filterChartColor } from '@/utils/holders'
import LineChart from './lineChart.vue'
import Insiders from './insiders.vue'
import ProfitLoss from './profitLoss.vue'
import {
  _getTop100range,
  _getTop100balance,
  _getAllTagsStats,
  type Top100range,
  type Top100Balance,
  type AllTagsStats,
} from '@/api/holders'
const route = useRoute()
const { t } = useI18n()
const { mode } = storeToRefs(useGlobalStore())
const botStore = useBotStore()
const checked = ref<boolean[]>([true, true, true, true, true, true, true])

const { globalConfig } = storeToRefs(useConfigStore())
const { token, totalHolders, price } = storeToRefs(useTokenStore())
const dialogProfitLoss = shallowRef<boolean>(false)
const top100range = ref<Top100range[]>([])
const loadingTop100Range = shallowRef<boolean>(false)
const tabActive = shallowRef<string>('100')

const top100balance = ref<Top100Balance[]>([])
const loadingTop100Balance = shallowRef<boolean>(false)

const insidersObj = ref<AllTagsStats>({})
const loadingStats = shallowRef<boolean>(false)
  const profitLossRef1 = ref()

const supportTags = computed(() => {
  const chain = addressAndChain.value.chain
  const chainsSupport =
    globalConfig.value?.chains_support_data_analysis_insider_sniper_V3
  const arr = chainsSupport?.[chain] || []
  return (
    arr?.map((i) => ({ ...i, color: filterChartColor(i.type)?.color })) || []
  )
})
const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: token.value?.token || '',
    chain: token.value?.chain || '',
  }
})
const language = computed(() => {
  return useLocaleStore().locale
})
const id = computed(() => {
  return route.params.id as string
})
const tabs = computed(() => {
  return [
    {
      cn: t('topN', { n: 100 }),
      en: t('topN', { n: 100 }),
      tw: t('topN', { n: 100 }),
      pt: t('topN', { n: 100 }),
      es: t('topN', { n: 100 }),
      type: '100',
    },
    ...totalHolders.value,
  ]
})
const top100balanceC = computed(() => {
  return top100balance.value.slice(0, Number(tabActive.value) || 200)
})

// console.log('-------totalHolders-------', totalHolders)
watch(
  () => id.value,
  (newId) => {
    if (newId) {
      init()
    }
  }
)
onMounted(() => {
  init()
})
function init() {
  if (tabActive.value === '100') {
    getTop100range()
    getTop100balance()
  } else {
    getAllTagsStats()
  }
}
function getTop100range() {
  loadingTop100Range.value = true
  _getTop100range(id.value)
    .then((res) => {
      // console.log('--------------------res-----------------------------', res)
      top100range.value = Array.isArray(res) ? res?.map(i => ({
        ...i,
        date: i?.date?.slice(5)
      })) : []
    })
    .catch(() => {})
    .finally(() => {
      loadingTop100Range.value = false
    })
}

function getTop100balance() {
  loadingTop100Balance.value = true
  const paramas = {
    token_id: id.value,
    address: botStore.evmAddress,
  }
  _getTop100balance(paramas)
    .then((res) => {
      console.log('--------------------res-----------------------------', res)
      top100balance.value = Array.isArray(res)
        ? res?.map((i) => ({
            ...i,
            newTags: i?.newTags?.filter(
              (m) => !new RegExp('^top.*$', 'gi').test(m?.type)
            ),
          }))
        : []
    })
    .catch(() => {})
    .finally(() => {
      loadingTop100Balance.value = false
    })
}
function formatProfit(item: {
  amount_diff_3days: number
  sell_volume_diff_3days: number
  buy_volume_diff_3days: number
}) {
  return (
    item?.amount_diff_3days * (price?.value || 0) +
    item?.sell_volume_diff_3days -
    item?.buy_volume_diff_3days
  )
}
function formatProportion(item: Top100Balance) {
  if (!Number(token?.value?.total)) {
    return '-'
  }
  return (
    formatNumber((item.amount_cur * 100) / Number(token?.value?.total), 2) + '%'
  )
}
function goLink() {}
function switchTabs(item: { type: string }) {
  tabActive.value = item.type
  if (item.type == '100') {
    getTop100balance()
  } else {
    getAllTagsStats()
  }
}

function getAllTagsStats() {
  loadingStats.value = true
  const paramas = {
    token_id: id.value,
    type: tabActive.value,
  }
  _getAllTagsStats(paramas)
    .then((res) => {
      console.log('--------------------res-----------------------------', res)
      insidersObj.value = res
    })
    .catch(() => {})
    .finally(() => {
      loadingStats.value = false
    })
}
function handlerDialogProfitLoss(row: { address: string }) {
  dialogProfitLoss.value = true
  profitLossRef1.value?.getUserTxs(row.address)
}

</script>

<style lang="scss" scoped>
.tabs {
  .tab-item {
    background: var(--d-1f242a-l-F5f5f5);
    border-radius: 4px;
    font-size: 12px;
    color: #787b86;
    letter-spacing: 0;
    line-height: 16px;
    font-weight: 400;
    padding: 4px 10px;
    cursor: pointer;
    &.active {
      color: var(--d-FFF-l-000);
    }
    & ~ .tab-item {
      margin-left: 5px;
    }
  }
}
:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu) {
  background-color: var(--custom-bg-1-color);
  // border: 1px solid var(--d-33353D-l-f5f5f5);
}

:deep(.el-table) {
  --el-table-tr-bg-color: #0A0B0D;
  --el-table-bg-color: #0A0B0D;
  --el-table-text-color: var(--d-222-l-F2F2F2);
  --el-table-header-bg-color: var(--d-17191C-l-F2F2F2);
  --el-fill-color-lighter: #0A0B0D;
  --el-table-header-text-color: var(--d-999-l-666);
  --el-table-border-color: var(--d-33353D-l-f5f5f5);
  --el-table-row-hover-bg-color: var(--d-333333-l-eaecef);
  background: #0A0B0D;
  --el-bg-color: #0A0B0D;
  --el-table-border: 0.5px solid var(--d-33353D-l-f5f5f5);
  font-size: 13px;

  th {
    padding: 6px 0;
    border-bottom: none !important;
    height: 32px;

    &.el-table__cell.is-leaf {
      border-bottom: none;
    }

    .cell {
      font-weight: 400;
      font-size: 12px;
    }
  }
}
</style>
