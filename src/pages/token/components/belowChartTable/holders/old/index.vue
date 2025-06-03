<template>
  <div class="holderInfoOld px-12px">
    <el-row :gutter="10">
      <el-col :span="10">
        <div class="title">
          {{ $t('holdersDetail') }} ({{ $t('excludeNullAndPoll') }})
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
          chartHeight="330px"
        />
      </el-col>
      <el-col :span="14">
        <div class="title flex items-center justify-between">
          <span>{{ $t('mainChip') }}</span>
          <div class="tabs">
            <template v-for="(item, index) in tabs" :key="index">
              <span
                class="tab-item"
                :class="{ active: item.type == tabActive }"
                @click.stop.prevent="tabActive = item.type"
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
          <table v-show="tabActive == '100'">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ $t('ratio') }}</th>
                <th>{{ $t('position') }}</th>
                <th>{{ $t('Change3D') }}</th>
                <th>{{ $t('profit1') }}($)</th>
                <th>{{ $t('address') }}&nbsp;&nbsp;&nbsp;&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in top100balanceC"
                :key="index"
                @click="goLink(item)"
              >
                <td class="index">
                  {{ index < 9 ? '0' + (index + 1) : index + 1 }}
                </td>
                <td>{{ formatProportion(item) }}</td>
                <td>{{ formatNumber(item?.amount_cur, 2) }}</td>
                <td
                  :style="{
                    color:
                      item.amount_diff_3days > 0 ? upColor[0] : downColor[0],
                  }"
                >
                  {{ formatNumber(item?.amount_diff_3days, 2) }}
                </td>
                <td
                  :style="{
                    color: formatProfit(item) > 0 ? upColor[0] : downColor[0],
                  }"
                >
                  {{ formatNumber(formatProfit(item), 2) }}
                </td>
              </tr>
            </tbody>
          </table>
          <Insiders v-show="tabActive !== '100'" />
        </el-scrollbar>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { filterLanguage } from '~/pages/token/components/kLine/utils'
import { getAddressAndChainFromId } from '@/utils/index'
import { upColor, downColor } from '@/utils/constants'
import { filterChartColor } from '@/utils/holders'
import LineChart from './lineChart.vue'
import {
  _getTop100range,
  _getTop100balance,
  type Top100range,
  type Top100Balance,
} from '@/api/holders'
const route = useRoute()
const { t } = useI18n()
const botStore = useBotStore()
const checked = ref<boolean[]>([true, true, true, true, true, true, true])

const { globalConfig } = storeToRefs(useConfigStore())
const { token, totalHolders, price } = storeToRefs(useTokenStore())
const top100range = ref<Top100range[]>([])
const loadingTop100Range = shallowRef<boolean>(false)
const tabActive = shallowRef<string>('100')

const top100balance = ref<Top100Balance[]>([])
const loadingTop100Balance = shallowRef<boolean>(false)

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
      getTop100range()
      getTop100balance()
    }
  },
  {
    immediate: true,
  }
)
function getTop100range() {
  loadingTop100Range.value = true
  _getTop100range(id.value)
    .then((res) => {
      // console.log('--------------------res-----------------------------', res)
      top100range.value = Array.isArray(res) ? res : []
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
      top100balance.value = Array.isArray(res) ? res : []
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
</script>

<style lang="scss" scoped>
.tabs {
  .tab-radio-input {
    width: 0;
    height: 0;
    font-size: 0;
    opacity: 0;
    &:checked + .tab-item {
      // background: #558BED;
      color: var(--custom-text-1-color);
    }
  }
  .tab-item {
    background: var(--custom-btn-bg-color);
    border-radius: 16px;
    font-size: 12px;
    color: var(--custom-text-2-color);
    letter-spacing: 0;
    line-height: 16px;
    font-weight: 400;
    padding: 4px 10px;
    cursor: pointer;
    &.active {
      color: var(--custom-text-1-color);
    }
    & ~ .tab-item {
      margin-left: 5px;
    }
  }
}
</style>
