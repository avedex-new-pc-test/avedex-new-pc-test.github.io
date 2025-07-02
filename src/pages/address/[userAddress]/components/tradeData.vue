<template>
  <div class="trade">
    <div class="trade-pnl">
      <div class="flex-between mb-[28px]">
        <span class="trade-pnl-title"> {{ $t('bestToken2') }}（{{ intervalText }}） </span>
        <ButtonGroup
          v-model:active-value="bestToken.filter"
          :options="bestTokenOptions"
          @change="changeFilter"
        />
      </div>
      <AveEmpty v-if="bestToken.series.data.length <= 0" :showText="false" />
      <AveCharts
        v-else
        :containerStyle="{
          height: '123px',
        }"
        :xAxis="bestToken.xAxis"
        :yAxis="{
          ...bestToken.yAxis,
          axisLabel: bestTokenAxisLabel,
        }"
        :series="bestToken.series"
        :grid="bestToken.grid"
      />
    </div>
    <div class="trade-pnl">
      <p class="trade-pnl-title trade-pnl-title2 mb-[28px]">
        {{ $t('profit3') }}（{{ intervalText }}）
      </p>
      <ul class="trade-pnl-stage">
        <li class="trade-pnl-stage-item" v-for="{ label, key, negative } in profitList" :key="key">
          <span>{{ label }}</span>
          <span
            class="flex-1 text-right color-green"
            :class="{
              'color-red': negative,
            }"
          >
            {{ txAnalysis.profit_range?.[key] }} ({{ getProfitRatio(key) }})
          </span>
        </li>
      </ul>
      <AveCharts
        ref="winProfitChart"
        :containerStyle="{
          height: '12px',
          margin: '0 -10px',
        }"
        :xAxis="winProfit.xAxis"
        :yAxis="winProfit.yAxis"
        :series="winProfit.series"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTxAnalysis } from '@/api/wallet'
// import { isNumericString } from "@/utils/utils"
import ButtonGroup from '@/components/buttonGroup.vue'
import AveCharts from '@/components/charts/aveCharts.vue'
import AveEmpty from '@/components/aveEmpty.vue'
// import { formatNumberS } from '@/utils/formatNumber'

const BestTokenEnum = {
  TOTAL_RATIO: 'total_profit_ratio',
  TOTAL_PROFIT: 'total_profit',
}

const props = defineProps({
  interval: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  chain: {
    type: String,
    default: '',
  },
  intervalText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['txAnalysisChange'])
const $t = getGlobalT()

// 响应式数据
const bestToken = ref({
  filter: BestTokenEnum.TOTAL_PROFIT,
  yAxis: {
    data: [],
  },
  grid: {
    left: '1',
    right: '2',
    top: '2',
  },
  series: {
    type: 'bar',
    data: [],
    itemStyle: {
      color: '#12B886',
    },
    barWidth: 14,
    label: {
      show: true,
      position: 'right',
      color: '#12B886',
      fontWeight: 'bold',
      offset: [-3, 0],
      formatter: (params) => {
        const isRatio = bestToken.value.filter === BestTokenEnum.TOTAL_RATIO
        const sign = isRatio ? '' : '$'
        const x = isRatio ? 'X' : ''
        return `${sign}${formatNumber(params.value, 1)}${x}`
      },
    },
  },
  xAxis: {},
})

const winProfit = ref({
  xAxis: {
    type: 'value',
    min: 0,
    max: 100,
    show: false,
  },
  yAxis: {
    type: 'category',
    data: [''],
    show: false,
  },
  grid: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  series: [
    {
      key: 'profit_above_500_percent',
      type: 'bar',
      stack: 'background',
      data: [],
      itemStyle: {
        color: 'rgba(18, 184, 134, 1)',
      },
      barWidth: 12,
    },
    {
      key: 'profit_200_500_percent',
      type: 'bar',
      stack: 'background',
      data: [],
      itemStyle: {
        color: 'rgba(18, 184, 134, 0.6)',
      },
      barWidth: 12,
    },
    {
      key: 'profit_0_200_percent',
      type: 'bar',
      stack: 'background',
      data: [],
      itemStyle: {
        color: 'rgba(18, 184, 134, 0.3)',
      },
      barWidth: 12,
    },
    {
      key: 'profit_neg50_0_percent',
      type: 'bar',
      stack: 'background',
      data: [],
      itemStyle: {
        color: 'rgba(246, 70, 93, 0.6)',
      },
      barWidth: 12,
    },
    {
      key: 'profit_neg100_neg50_percent',
      type: 'bar',
      stack: 'background',
      data: [],
      itemStyle: {
        color: 'rgba(246, 70, 93, 1)',
      },
      barWidth: 12,
    },
  ],
})

const txAnalysis = ref({})
const winProfitChart = ref(null)

// 计算属性
// const mode = computed(() => store.state.mode)
const themeStore = useThemeStore()
const mode = computed(() => {
  return themeStore.isDark ? 'dark' : 'light'
})
const bestTokenOptions = computed(() => [
  {
    id: BestTokenEnum.TOTAL_RATIO,
    name: $t('ROI'),
  },
  {
    id: BestTokenEnum.TOTAL_PROFIT,
    name: $t('profit3'),
  },
])
const bestTokenAxisLabel = computed(() => {
  const colorMap = {
    dark: '#fff',
    light: '#333',
  }
  return {
    color: colorMap[mode.value],
    formatter: '{value}',
    show: true,
    fontWeight: 'bold',
  }
})
const profitList = computed(() => [
  {
    label: '＞500%',
    key: 'profit_above_500_percent',
    negative: false,
  },
  {
    label: '200% - 500%',
    key: 'profit_200_500_percent',
    negative: false,
  },
  {
    label: '0% - 200%',
    key: 'profit_0_200_percent',
    negative: false,
  },
  {
    label: '-50% - 0%',
    key: 'profit_neg50_0_percent',
    negative: true,
  },
  {
    label: '＜ -50%',
    key: 'profit_neg100_neg50_percent',
    negative: true,
  },
])
const chainAddress = computed(() => [props.chain, props.address])

// 方法
const onGetTxAnalysis = () => {
  const { address, chain, interval } = props
  getTxAnalysis({
    user_address: address,
    user_chain: chain,
    interval,
  })
    .then((res) => {
      txAnalysis.value = res || {}
      emit('txAnalysisChange', res || {})
      formatBestTokenData()
      formatWinProfit()
    })
    .catch((err) => {
      console.log(err)
    })
}

const changeFilter = () => {
  formatBestTokenData()
}

const formatBestTokenData = () => {
  const { best_token = [] } = txAnalysis.value
  bestToken.value.yAxis.data = best_token.map((el) => el.symbol)
  bestToken.value.series.data = best_token.map((el) => Math.max(el[bestToken.value.filter], 0.1))
  bestToken.value.xAxis.max = Math.max(...bestToken.value.series.data) * 1.3
}

const formatWinProfit = () => {
  const sum = txAnalysis.value.profit_range?.total_count
  let firstNonEmptyIndex, lastNonEmptyIndex
  const series = winProfit.value.series.map((el, idx) => {
    const num = txAnalysis.value.profit_range?.[el.key]
    const data = parseInt((num / sum) * 100)
    if (data > 0) {
      lastNonEmptyIndex = idx
      if (typeof firstNonEmptyIndex === 'undefined') {
        firstNonEmptyIndex = idx
      }
    }
    return {
      ...el,
      data: [data],
      itemStyle: {
        color: el.itemStyle.color,
        borderRadius: [0, 0, 0, 0],
      },
    }
  })

  if (typeof firstNonEmptyIndex !== 'undefined' && typeof lastNonEmptyIndex !== 'undefined') {
    series[firstNonEmptyIndex].itemStyle.borderRadius = [6, 0, 0, 6]
    series[lastNonEmptyIndex].itemStyle.borderRadius = [0, 6, 6, 0]
  }
  winProfit.value.series = series
}

const getProfitRatio = (key) => {
  const num = txAnalysis.value.profit_range?.[key]
  const sum = txAnalysis.value.profit_range?.total_count
  return formatNumber(num / sum, 2) + '%'
}

// 监听器
watch(() => props.interval, onGetTxAnalysis)
watch(chainAddress, onGetTxAnalysis)

// 生命周期
onMounted(() => {
  onGetTxAnalysis()
})
</script>

<style scoped lang="scss">
.trade {
  display: flex;
  width: 40vw;
  border-radius: 8px;
  background-color: #15171c;
  --a-text-1-light-color: #222;
  --color-teal-300: #12b886;
  --color-red-500: #f6465d;

  &-pnl {
    min-width: 0;
    flex: 1;
    padding: 20px;

    &-title {
      margin-top: 0;
      color: var(--d-666-l-959A9F);
      font-size: 14px;
      line-height: 17px;
      text-align: center;
    }

    &-title2 {
      line-height: 28px;
      text-align: left;
    }

    &-sum {
      margin: 16px 0 8px;
      color: var(--d-fff-l-333);
      font-size: 24px;
      line-height: 30px;
      text-align: center;
    }

    &-profit {
      margin-top: 4px;
      margin-bottom: 16px;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      text-align: center;
      color: var(--color-teal-300);

      &-negative {
        color: var(--color-red-500);
      }
    }

    &-percent {
      font-weight: bold;
      font-size: 12px;
      color: var(--color-teal-300);
    }

    &-progress {
      margin-bottom: 16px;
      text-align: center;
      --el-fill-color-light: rgba(18, 184, 134, 0.1);
    }

    &-stage {
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      &-item {
        display: flex;
        align-items: center;

        &:before {
          margin-right: 2px;
          content: '';
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--color-teal-300);
        }

        > span {
          flex-shrink: 0;
          font-weight: 500;
          font-size: 12px;
          color: var(--d-fff-l-333);
        }

        .color-green {
          color: var(--color-teal-300);
        }

        .color-red {
          color: var(--color-red-500);
        }

        &:nth-child(2):before {
          opacity: 0.6;
        }

        &:nth-child(3):before {
          opacity: 0.3;
        }

        &:nth-child(4):before {
          opacity: 0.6;
          background-color: var(--color-red-500);
        }

        &:nth-child(5):before {
          background-color: var(--color-red-500);
        }
      }
    }
  }

  &-rate {
    flex: 1;
    padding: 20px;
  }
}
</style>
