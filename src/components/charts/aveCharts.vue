<template>
  <div ref="areaChart" :style="containerStyle" />
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { merge, debounce } from 'lodash-es'

const globalStore = useGlobalStore()
const defaultSettings = {
  grid: {
    left: '10', //图表距边框的距离
    right: '10',
    top: '3',
    bottom: '0',
    containLabel: true,
  },
  xAxis: {
    splitLine: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#787B86',
      show: false,
    },
    boundaryGap: false,
  },
  yAxis: {
    nameTextStyle: {
      fontSize: 12,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
}
let myChart: echarts.ECharts | null = null
const props = defineProps({
  containerStyle: {
    type: Object,
    required: true,
  },
  grid: {
    type: Object,
    default: () => ({}),
  },
  dataset: Object,
  xAxis: {
    type: Object,
    default: () => ({}),
  },
  yAxis: {
    type: Object,
    default: () => ({}),
  },
  series: {
    type: [Object, Array],
    default: () => ({}),
  },
  tooltip: {
    type: Object,
    default: () => ({
      show: false,
    }),
  },
  legend: {
    type: Object,
    default: () => ({
      show: false,
    }),
  },
  graphic: Object,
})
const { series, tooltip, legend, dataset, graphic } = props

function mergeOption() {
  const { grid, xAxis, yAxis } = defaultSettings
  const newGrid = merge({}, grid, grid)
  const newXAxis = merge({}, xAxis, xAxis)
  const newYAxis = merge({}, yAxis, yAxis)
  return {
    grid: newGrid,
    xAxis: newXAxis,
    yAxis: newYAxis,
    series: series,
    tooltip: tooltip,
    legend: legend,
    dataset: dataset,
    graphic: graphic,
  }
}
function initChart() {
  const chartDom = useTemplateRef('areaChart')
  if (!myChart) {
    myChart = echarts.init(chartDom)
  }
  const option = mergeOption()
  myChart.setOption(option)
}
onMounted(() => {
  initChart()
  const chartDom = useTemplateRef('areaChart')
  const currentChart = echarts.getInstanceByDom(chartDom)
  const resizeObserver = new ResizeObserver(
    debounce(() => {
      currentChart?.resize()
    }, 300)
  )
  resizeObserver.observe(chartDom)
})

watch(
  () => props.dataList,
  () => initChart()
)
watch(
  () => globalStore.showLeft,
  async () => {
    await nextTick()
    myChart?.resize()
  }
)
</script>

<style scoped lang="scss"></style>
