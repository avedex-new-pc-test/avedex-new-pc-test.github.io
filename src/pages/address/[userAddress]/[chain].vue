<template>
  <div className="flex flex-col gap-3 p-[20px] pt-[10px]  pb-0">
    <div class="flex-between">
      <el-select
        :style="{ width: '120px' }"
        :model-value="chain"
        @change="
          (val) => {
            $router.push({
              name: 'Balance',
              params: { chain: val, userAddress: getBot(val)?.address },
            })
          }
        "
      >
        <template #prefix>
          <ChainToken :chain="chain" :width="16" />
        </template>
        <el-option
          v-for="chain in smartChains"
          :key="chain.name"
          :label="chain.name"
          :value="chain.name"
        >
          <div class="flex-center" style="gap: 4px">
            <ChainToken :chain="chain" :width="16" />
            {{ chain.name }}
          </div>
        </el-option>
      </el-select>
      <el-radio-group
        v-model="interval"
        class="m-radio-group"
        size="small"
        :fill="isDark ? '#333' : '#666'"
        :text-color="isDark ? '#F5F5F5' : '#FFF'"
        @change="(v) => console.log('v', v)"
      >
        <el-radio-button
          v-for="option in options"
          :key="option.id"
          v-model="interval"
          :label="option.name"
          :value="option.id"
        />
      </el-radio-group>
    </div>

    <div class="flex align-stretch">
      <Statistic
        ref="statisticRef"
        :isSelfAddress="isSelfAddress"
        :address="address"
        :chain="chain"
        :interval="interval"
        :intervalText="intervalText"
      />
      <TradeData
        :interval="interval"
        :intervalText="intervalText"
        :address="address"
        :chain="chain"
        @txAnalysisChange="txAnalysisChange"
      />
    </div>
  </div>
</template>
<script setup>
import Statistic from './components/statistic.vue'
import TradeData from './components/tradeData.vue'
const interval = ref('7D')
const route = useRoute()
const chain = route.params.chain
const address = route.params.userAddress
const $t = getGlobalT()
const statisticRef = ref(null)

const options = [
  {
    name: `24${$t('H')}`,
    id: '24H',
  },
  {
    name: `7${$t('D')}`,
    id: '7D',
  },
  {
    name: `30${$t('D')}`,
    id: '30D',
  },
]
//computed
const currentBot = computed(() => {
  return getBot(chain || 'solana')
})

const intervalText = computed(() => {
  return options.find((item) => interval.value === item.id)?.name
})
const smartChains = computed(() => {
  const chainIds = ['solana', 'bsc']
  // 如果是自己的钱包地址且为 bot 钱包那么展示所有的链，链钱包后面再改
  // if (currentBot.value?.address === userAddress || chain) {
  //   const botChains = this.bot?.userInfo?.addresses?.filter((el) => chainIds.includes(el.chain))
  //   if (botChains && botChains.length > 0) {
  //     return botChains
  //   }
  // }
  return [
    {
      chain,
    },
  ]
})

const statisticsTableRef = computed(() => {
  return this.$refs.statisticsTable
})

//methods
function changeTrendQuery(params) {
  const $trendList = this.$refs.statisticsTable.$refs.trendList
  if ($trendList) {
    $trendList.parentSetTime(params)
  }
}
function getBot(val) {
  return {} //bot.value?.userInfo?.addresses?.find?.((i) => i?.chain === val) || {}
}
function txAnalysisChange(data) {
  if (statisticRef.value) {
    statisticRef.value.mergeStatistics(data) // 调用子组件方法
  }
}
</script>

<style scoped lang="scss">
.m-radio-group {
  :deep()
    .el-radio-button
    .el-radio-button__original-radio:not(:disabled)
    + .el-radio-button__inner {
    border-color: var(--d-333-l-666);
  }
}
</style>
