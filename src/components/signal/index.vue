<script setup lang="ts">
import {useStorage} from '@vueuse/core'
import {getSignalV2List, type GetSignalV2ListResponse, type IActionItem} from '~/api/signal'
import SlippageSet from '~/pages/token/components/right/botSwap/slippageSet.vue'
import Filter from '~/components/signal/filter.vue'
import SelectIcon from '~/components/signal/selectIcon.vue'
import QuickBuyInput from '~/components/signal/quickBuyInput.vue'
import SmallSignalList from '~/components/signal/smallSignalList.vue'
import MiddleSignalList from '~/components/signal/middleSignalList.vue'
import LargeSignalList from '~/components/signal/largeSignalList.vue'

const configStore = useConfigStore()
const botSettingStore = useBotSettingStore()
const signalList = shallowRef<GetSignalV2ListResponse[]>([])
const queryParams = shallowRef({
  pageNO: 1,
  pageSize: 20,
})
const chainOptions = shallowRef(['solana', 'bsc'])
const activeChain = shallowRef('solana')

function setActiveChain(chain: string) {
  activeChain.value = chain
  resetAndGet()
}

const listStatus = ref({
  loading: false,
  finished: false,
  error: false
})

function resetAndGet() {
  listStatus.value.finished = false
  listStatus.value.error = false
  queryParams.value.pageNO = 1
  fetchSignalList()
}

const shouldAlert = useStorage('shouldAlert', '1')
const quickBuyValue = useStorage('quickBuyValue', '0.01')
const containerWidth = shallowRef(320)
// const [containerWidth, rightDrag] = useDrag({
//   defaultValue: 240,
//   maxValue: 720,
//   minValue: 240,
//   direction: 'clientX'
// })
onMounted(() => {
  fetchSignalList()
  initTimer()
  initWs()
})
let timer: number
watch(activeChain, () => {
  queryParams.value.pageNO = 1
  fetchSignalList()
  initWs()
})

const wsStore = useWSStore()

function initWs() {
  wsStore.send({
    'jsonrpc': '2.0',
    method: 'unsubscribe',
    'params': [
      'signalsv2_public_monitor',
      activeChain.value
    ],
    'id': 1
  })

  wsStore.send({
    'jsonrpc': '2.0',
    method: 'subscribe',
    'params': [
      'signalsv2_public_monitor',
      activeChain.value
    ],
    'id': 1
  })
}

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

onUnmounted(() => {
  cancelAnimationFrame(timer)
})

const signalAudio = useTemplateRef('signalAudio')
watch(() => wsStore.wsResult[WSEventType.SIGNALSV2_PUBLIC_MONITOR], (_signalData) => {
  if (shouldAlert.value === '1' && signalAudio.value) {
    signalAudio.value.currentTime = 0
    signalAudio.value.play()
  }
  const matchIndex = signalList.value.findIndex((p) =>
    p.token === _signalData.id && p.chain === _signalData.chain
  )
  if (matchIndex !== -1) {
    signalList.value[matchIndex] = _signalData
    triggerRef(signalList)
  }
})

/**
 * 作为推送接口使用，只更新数据
 */
async function updateListData() {
  try {
    const res = await getSignalV2List({
      chain: activeChain.value,
      pageNO: 1,
      pageSize: 50,
      fold: true
    })
    const addressMap: Record<string, GetSignalV2ListResponse> = {}
    ;(res || []).forEach((item) => {
      if (!addressMap[item.token + item.chain]) {
        addressMap[item.token + item.chain] = item
      }
    })
    signalList.value = signalList.value.map(item => {
      const updateKeys = ['mc_cur', 'holders_cur', 'top10_ratio', 'dev_ratio', 'insider_ratio', 'max_price_change'] as const
      const matchedNewData = addressMap[item.token + item.chain]
      if (matchedNewData) {
        const result = {} as Record<string, GetSignalV2ListResponse>
        updateKeys.forEach(updateKey => {
          result[updateKey] = matchedNewData[updateKey]
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

async function fetchSignalList() {
  try {
    listStatus.value.loading = true
    const res = await getSignalV2List({
      ...queryParams.value,
      chain: activeChain.value,
      fold: true
    })
    if (queryParams.value.pageNO === 1) {
      signalList.value = res || []
    } else {
      signalList.value = signalList.value.concat(res || [])
    }
    const finished = res?.length < queryParams.value.pageSize
    listStatus.value.finished = finished
    if (!finished) {
      queryParams.value.pageNO++
    }
  } catch (e) {
    listStatus.value.error = true
    signalList.value = []
  } finally {
    listStatus.value.loading = false
  }
}

let hideTimer: number | NodeJS.Timeout
const buttonRef = ref<null | HTMLElement>(null)
const currentActions = shallowRef<IActionItem[]>([])
const popVisible = shallowRef(false)

function showPopover(e: MouseEvent, actions: IActionItem[]) {
  buttonRef.value = e.currentTarget
  currentActions.value = actions || []
  popVisible.value = true
}

function hidePopover() {
  buttonRef.value = null
  popVisible.value = false
}

function scheduleHide() {
  hideTimer = setTimeout(() => {
    hidePopover()
  }, 500)
}

function cancelHide() {
  clearTimeout(hideTimer)
}
</script>

<template>
  <div
    class="bg-[--d-111-l-FFF] p-12px relative shrink-0 signal"
    :style="{
      width:`${containerWidth}px`,
    }"
  >
    <div
      class="flex items-center justify-between mb-16px pb-12px border-b-solid border-b-1px border-b-[--d-333-l-F5F5F5]">
      <span class="color-[--d-FFF-l-222] text-14px">信号广场</span>
      <div class="flex items-center gap-12px">
        <Filter
          v-if="containerWidth>540"
          v-model="shouldAlert"
        />
        <el-select
          size="small"
          placeholder=""
          :suffix-icon="SelectIcon"
          popper-class="[&&]:[--el-fill-color-light:--d-222-l-F2F2F2] [--el-bg-color-overlay:--d-1A1A1A-l-FFF]"
          @change="setActiveChain"
        >
          <template #prefix>
            <el-image
              class="flex items-center rounded-full w-12px h-12px"
              :src="`${configStore.token_logo_url}chain/${activeChain}.png`"
            />
            <span class="text-10px color-[--d-FFF-l-333]">
              {{ activeChain.slice(0, 3).toUpperCase() }}
            </span>
          </template>
          <el-option
            v-for="net_name in chainOptions"
            :key="net_name"
            :value="net_name"
            class="[&&]:text-10px flex items-center"
          >
            <el-image
              class="flex items-center rounded-full w-12px h-12px mr-4px"
              :src="`${configStore.token_logo_url}chain/${net_name}.png`"
            />
            {{ net_name.slice(0, 3).toUpperCase() }}
          </el-option>
        </el-select>
        <QuickBuyInput
          v-if="containerWidth>540"
          v-model="quickBuyValue"
          size="small"
          class="[--el-border-color:transparent]"
        />
        <SlippageSet
          :chain="activeChain"
          :setting="botSettingStore?.botSettings[activeChain]"
        />
        <Icon
          name="custom:close"
          class="text-14px shrink-0 cursor-pointer"
        />
      </div>
    </div>
    <div
      v-if="containerWidth<540"
      class="flex items-center justify-between mb-18px"
    >
      <Filter
        v-model="shouldAlert"
      />
      <QuickBuyInput
        v-model="quickBuyValue"
        size="small"
        class="[--el-border-color:transparent]"
      />
    </div>
    <SmallSignalList
      v-if="containerWidth<320"
      :signalList="signalList"
    />
    <MiddleSignalList
      v-else-if="containerWidth<540"
      :signalList="signalList"
      :showPop="showPopover"
      :hidePop="scheduleHide"
    />
    <LargeSignalList
      v-else
      :signalList="signalList"
    />
    <!--<div-->
    <!--  class="absolute right-0 top-0 bottom-0 w-2px cursor-col-resize"-->
    <!--  @mousedown.stop.prevent="rightDrag"-->
    <!--/>-->
    <audio
      ref="signalAudio" controls style="display: none"
      src="@/assets/audio/signal.mp3"/>

    <!--  actions -->
    <el-popover
      :width="390"
      :visible="popVisible"
      :virtual-ref="buttonRef"
      popper-class="[--el-bg-color-overlay:--d-1A1A1A-l-FFF] max-h-200px"
      virtual-triggering
      append-to-body
    >
      <div class="flex color-[--d-666-l-999] text-12px">
        <div class="flex-1">
          {{ $t('wallet') }}
        </div>
        <div class="flex-[2]">
          {{ $t('operate') }}
        </div>
        <div class="flex-[2]">
          {{ $t('time') }}
        </div>
      </div>
      <div
        v-for="({
          wallet_alias,
          wallet_address,
          quote_token_amount,
          quote_token_symbol,
          quote_token_volume
        },idx) in currentActions"
        :key="idx"
        class="flex color-[--d-666-l-999] text-12px"
      >
        <div class="flex-1 flex items-center">
          <span class="w-10px h-10px rounded-full bg-#37B270 mt-4px"></span>
          <span class="color-[--d-F5F5F5-l-333]">{{ wallet_alias || $t('wallet') }}</span>
          <span class="color-[--d-999-l-666]">*{{ wallet_address.slice(-4) }})</span>
        </div>
        <div class="flex-[2] color-#12B886">
          {{ $t('buy') }}{{ formatNumber(quote_token_amount, 2) }} {{
            quote_token_symbol
          }}<span class="color-[--d-999-l-666]">(${{ formatNumber(quote_token_volume, 0) }})</span>
        </div>
        <div class="flex-[2]">

        </div>
      </div>
    </el-popover>
  </div>
</template>

<style lang="scss">
.signal {
  .el-select {
    --el-select-width: 60px;
    --el-fill-color-blank: var(--d-222-l-FFF);
  }

  .el-select--small .el-select__wrapper {
    gap: 1px;
    min-height: 20px;
    line-height: 14px;
  }
}
</style>
