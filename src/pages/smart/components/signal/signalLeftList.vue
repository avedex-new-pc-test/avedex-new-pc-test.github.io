<script setup lang="ts">
import {getSignalV2List, type GetSignalV2ListResponse, type IActionItem, type ISignalFilter} from '~/api/signal'
import dayjs from 'dayjs'
import {useStorage, useWindowSize} from "@vueuse/core";

const localeStore = useLocaleStore()
const props = defineProps<{
  activeChain: string
}>()
const listData = shallowRef<GetSignalV2ListResponse[]>([])
const listStatus = ref({
  loading: false,
  finished: false,
  error: false
})
const pageParams = shallowRef({
  pageNO: 1,
  pageSize: 20,
})

const tempQueryParams = shallowRef<ISignalFilter>({})
defineExpose({
  fetchSignalList: (queryParams?: ISignalFilter) => {
    if (queryParams) {
      tempQueryParams.value = queryParams
    }
    pageParams.value.pageNO = 1
    fetchSignalList()
  }
})
watch(() => props.activeChain, () => {
  pageParams.value.pageNO = 1
  fetchSignalList()
})

async function fetchSignalList() {
  try {
    listStatus.value.loading = true
    const res = await getSignalV2List({
      ...tempQueryParams.value,
      ...pageParams.value,
      fold: false,
      chain: props.activeChain
    })
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

let hideTimer: number | NodeJS.Timeout
const buttonRef = ref<null | HTMLElement>(null)
const currentActions = shallowRef<IActionItem[]>([])

const popVisible = shallowRef(false)

function showPopover(e: MouseEvent, actions: IActionItem[]) {
  buttonRef.value = e.currentTarget as HTMLElement | null
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

const isShowDate = ref(true)
const {height} = useWindowSize()
const width = useStorage('signalLefWid', 546)
</script>

<template>
  <el-scrollbar
    :style="`width:${width}px`"
    :height="height-280"
  >
    <AveEmpty
      v-if="!listData.length&&!listStatus.loading"
    />
    <div
      class="flex flex-col gap-4px bg-[--d-111-l-FFF] ml-4px"
    >
      <div
        v-for="({
          history_count,
          tag,
          action_count
        },index) in listData"
        :key="index"
        class="p-16px rounded-8px"
      >
        <div class="flex justify-between">
          <div class="flex items-center gap-8px">
            <div
              class="flex items-center gap-4px relative ml--20px p-6px h-26px color-#FFF lh-14px rounded-r-3px rounded-b-3px bg-#333"
            >
                <span
                  class="absolute bottom--4px left--4px w-0 h-0 border-t-solid border-t-4px border-t-transparent border-r-4px border-r-solid border-r-transparent border-l-4px border-l-solid border-l-#333 transform-scale-x-[-1] transform-scale-y-[-1]"
                ></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.91667 5.83324H4.38914C4.78414 5.83324 5.16588 5.69314 5.46672 5.43814L8.54248 2.83235C9.44665 2.06651 10.8341 2.70916 10.8341 3.89416V16.1057C10.8341 17.2907 9.44665 17.9341 8.54248 17.1675L5.46672 14.5617C5.16588 14.3067 4.78414 14.1666 4.38914 14.1666H2.91667C2.22667 14.1666 1.66667 13.6066 1.66667 12.9166V7.08406C1.66667 6.39322 2.22667 5.83324 2.91667 5.83324ZM13.9725 13.9757C15.0383 12.9149 15.625 11.5024 15.625 9.99991C15.625 8.49741 15.0383 7.08491 13.9725 6.02408C13.7275 5.78075 13.3317 5.78071 13.0884 6.02571C12.8442 6.26987 12.8458 6.66657 13.09 6.9099C13.9183 7.7349 14.375 8.83322 14.375 10.0007C14.375 11.1682 13.9183 12.2665 13.09 13.0915C12.8458 13.3349 12.8442 13.7307 13.0884 13.9757C13.21 14.0982 13.3709 14.1599 13.5309 14.1599C13.6909 14.1582 13.85 14.0974 13.9725 13.9757ZM15.8892 16.5166C15.7292 16.5166 15.5683 16.4558 15.4467 16.3333C15.2033 16.0892 15.2033 15.6933 15.4483 15.4491C16.9058 13.9958 17.7083 12.0607 17.7083 9.99991C17.7083 7.93908 16.9058 6.00486 15.4483 4.55069C15.2033 4.30652 15.2033 3.91066 15.4467 3.6665C15.69 3.42233 16.0859 3.42151 16.3309 3.66568C18.025 5.35568 18.9583 7.60574 18.9583 9.99991C18.9583 12.3941 18.025 14.6441 16.3309 16.3341C16.2084 16.4558 16.0492 16.5166 15.8892 16.5166Z"
                  fill="#fff"/>
              </svg>
              {{ history_count }}
            </div>
            <div
              class="flex items-center gap-4px px-8px py-6px rounded-4px h-26px text-12px lh-12px color-#12B886 bg-#12B8861A"
            >
              <img class="w-14px h-14px" :src="formatIconTag(tag)" alt="">
              {{ action_count }}{{ $t('smart_money_trade') }}{{ $t(tag) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="listStatus.loading" class="flex justify-center text-12px text-[#959a9f]">{{ $t('loading') }}</div>
  </el-scrollbar>
  <!--  actions -->
  <el-popover
    :width="390"
    :virtual-ref="buttonRef"
    :visible="popVisible"
    popper-class="[--el-bg-color-overlay:--d-1A1A1A-l-FFF] max-h-200px"
    virtual-triggering
    append-to-body
  >
    <div
      @mouseenter="cancelHide"
      @mouseleave="hidePopover"
    >
      <div class="flex color-[--d-666-l-999] text-12px mb-8px">
        <div class="flex-[3]">
          {{ $t('wallet') }}
        </div>
        <div class="flex-[4]">
          {{ $t('operate') }}
        </div>
        <div class="flex-[2] flex items-center justify-end gap-4px">
          {{ $t('time') }}
          <Icon
            :name="`${isShowDate ? 'custom:calendar' : 'custom:countdown'}`"
            class="color-[--d-666-l-999] cursor-pointer" @click.self="isShowDate = !isShowDate"
          />
        </div>
      </div>
      <div class="flex flex-col gap-12px">
        <div
          v-for="({
          wallet_alias,
          wallet_address,
          quote_token_amount,
          quote_token_symbol,
          quote_token_volume,
          action_time
        },idx) in currentActions"
          :key="idx"
          class="flex color-[--d-999-l-666] text-12px lh-14px"
        >
          <div class="flex-[3] flex items-center">
            <span class="w-10px h-10px rounded-full bg-#37B270 mr-4px"/>
            <span class="color-[--d-F5F5F5-l-333] whitespace-nowrap overflow-hidden text-ellipsis max-w-60px">{{
                wallet_alias || $t('wallet')
              }}</span>
            <span class="color-[--d-999-l-666]">(*{{ wallet_address.slice(-4) }})</span>
          </div>
          <div class="flex-[4] color-#12B886">
            {{ $t('buy') }}{{ localeStore.locale === 'en' ? ' ' : '' }}{{ formatNumber(quote_token_amount, 2) }} {{
              quote_token_symbol
            }}<span class="color-[--d-999-l-666]">(${{ formatNumber(quote_token_volume, 0) }})</span>
          </div>
          <div class="flex-[2] flex justify-end">
            <template v-if="isShowDate">
              {{ formatDate(action_time * 1000, 'MM/DD HH:mm:ss') }}
            </template>
            <template v-else>
              {{ dayjs(action_time * 1000).fromNow() }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">

</style>
