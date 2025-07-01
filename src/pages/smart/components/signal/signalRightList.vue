<script setup lang="ts">
import {
  getSignalV2List,
  type GetSignalV2ListResponse,
  getSignalV3List,
  type IActionItem,
  type IActionV3Item
} from '~/api/signal'
import {useThrottleFn, useWindowSize} from '@vueuse/core'
import SignalRightItem from '~/pages/smart/components/signal/signalRightItem.vue'

const filterToken = shallowRef('')
const props = defineProps<{
  activeChain: string
  quickBuyValue: string
}>()
const listData = shallowRef<GetSignalV2ListResponse<IActionItem | IActionV3Item>[]>([])
const listStatus = ref({
  loading: false,
  finished: false,
  error: false
})
const pageParams = shallowRef({
  pageNO: 1,
  pageSize: 20,
})

const {height} = useWindowSize()
const scrollbar = useTemplateRef('scrollbar')

const onScroll = useThrottleFn(({scrollTop}: { scrollTop: number }) => {
  if (scrollbar.value) {
    const scrollElement = scrollbar.value.wrapRef
    if (scrollElement && scrollElement.scrollHeight - scrollTop - (height.value - 280) < 30) {
      fetchSignalList()
    }
  }
}, 100, true, false)

watch(() => [props.activeChain, filterToken.value], () => {
  listData.value = []
  pageParams.value.pageNO = 1
  listStatus.value.finished = false
  listStatus.value.error = false
  fetchSignalList()
})

const botStore = useBotStore()

function getListApi(): Promise<GetSignalV2ListResponse<IActionItem | IActionV3Item>[]> {
  return filterToken.value
    ? getSignalV2List({
      ...pageParams.value,
      chain: props.activeChain,
      fold: false,
      token: filterToken.value
    })
    : getSignalV3List({
      ...pageParams.value,
      chain: props.activeChain,
      wallet_address: botStore.getWalletAddress(props.activeChain)
    })
}

async function fetchSignalList() {
  if (listStatus.value.loading || listStatus.value.finished) {
    return
  }
  try {
    listStatus.value.loading = true
    const res = await getListApi()
    if (pageParams.value.pageNO === 1) {
      listData.value = res || []
    } else {
      listData.value = listData.value.concat(res || [])
    }
    const finished = res?.length < pageParams.value.pageSize
    listStatus.value.finished = finished
    if (!finished) {
      pageParams.value.pageNO++
    }
  } catch (e) {
    console.log(e, 'error')
    listStatus.value.error = true
    listData.value = []
  } finally {
    listStatus.value.loading = false
  }
}

let timer: number

function initTimer() {
  let lastFetchSignalTime = 0
  const callback = () => {
    if (Date.now() - lastFetchSignalTime >= 5000) {
      updateListData()
      lastFetchSignalTime = Date.now()
    }
    timer = requestAnimationFrame(callback)
  }
  timer = requestAnimationFrame(callback)
}

/**
 * 作为推送接口使用，只更新数据
 */
async function updateListData() {
  try {
    const res = await getListApi()
    const addressMap: Record<string, GetSignalV2ListResponse> = {}
    ;(res || []).forEach((item) => {
      if (!addressMap[item.token + item.chain]) {
        addressMap[item.token + item.chain] = item
      }
    })
    listData.value = listData.value.map(item => {
      const updateKeys = ['mc_cur', 'holders_cur', 'top10_ratio', 'dev_ratio', 'insider_ratio', 'max_price_change'] as const
      const matchedNewData = addressMap[item.token + item.chain]
      if (matchedNewData) {
        const result = {} as Record<string, GetSignalV2ListResponse>
        updateKeys.forEach(updateKey => {
          result[updateKey] = matchedNewData[updateKey] as any
        })
        return {
          ...item,
          ...result
        }
      }
      return item
    })
  } catch (e) {
    console.log('=>(signalList.vue:106) e', e)
  }
}

onMounted(() => {
  fetchSignalList()
  initTimer()
})
onUnmounted(() => {
  cancelAnimationFrame(timer)
})

defineExpose({
  setToken: (val: string) => {
    filterToken.value = val
  }
})

const emit = defineEmits(['setResetBtn'])

function filter(token: string) {
  filterToken.value = token
  emit('setResetBtn', !!token)
}

const currentSignal = shallowRef<GetSignalV2ListResponse<IActionItem | IActionV3Item>>({})
const visible = shallowRef(false)

function openDrawer(item: GetSignalV2ListResponse<IActionItem | IActionV3Item>) {
  visible.value = true
  currentSignal.value = item
}
</script>

<template>
  <el-scrollbar
    ref="scrollbar"
    class="flex-1"
    :height="height-286"
    @scroll="onScroll"
  >
    <div class="flex flex-wrap gap-4px">
      <SignalRightItem
        v-for="(item,index) in listData"
        :key="index"
        :item="item"
        :filterToken="filterToken"
        :filter="filter"
        :activeChain="activeChain"
        :quickBuyValue="quickBuyValue"
        @openDrawer="openDrawer"
      />
    </div>
    <div v-if="listStatus.loading" class="flex py-10px justify-center text-12px text-[#959a9f]">{{
        $t('loading')
      }}
    </div>
  </el-scrollbar>
  <el-drawer
    v-model="visible"
    append-to-body
    :size="480"
  >
    <template #header>
      <span class="color-[--d-F5F5F5-l-333] text-20px">{{ $t('SignalDetail') }}</span>
    </template>
    <template #default>
      <SignalRightItem
        class="bg-transparent w-auto rounded-none px-20px py-0"
        :item="currentSignal"
        :active-chain="activeChain"
        :footer="false"
        is-wallet-all
      />
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">

</style>
