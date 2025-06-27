<script setup lang="ts">
import {getSignalV2List, type GetSignalV2ListResponse, type IActionItem, type ISignalFilter} from '~/api/signal'
import dayjs from 'dayjs'
import {useStorage, useWindowSize} from '@vueuse/core'
import QuickSwapButton from '~/components/quickSwap/quickSwapButton.vue'

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
    listData.value = []
    pageParams.value.pageNO = 1
    fetchSignalList()
  }
})
watch(() => props.activeChain, () => {
  listData.value = []
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
const quickBuyValue = useStorage('quickBuyValue', '0.01')

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
      class="pt-100px"
      v-if="!listData.length&&!listStatus.loading"
    />
    <div
      class="flex flex-col gap-4px ml-4px"
    >
      <div
        v-for="({
          history_count,
          tag,
          action_count,
          signal_time,
          symbol,
          chain,
          logo,
          token,
          issue_platform,
          token_create_time,
          top10_ratio,
          insider_ratio,
          dev_ratio,
          max_price_change,
          first_signal_time,
          mc,
          mc_cur,
          holders_cur,
          headline
        },index) in listData"
        :key="index"
        class="p-16px rounded-8px bg-[--d-111-l-FFF]"
      >
        <div class="mb-22px flex justify-between">
          <div class="flex items-center gap-8px">
            <div
              class="flex items-center gap-4px relative ml--20px p-6px h-26px color-#FFF lh-14px rounded-r-3px rounded-b-3px bg-#333"
            >
                <span
                  class="absolute bottom--4px left--4px w-0 h-0 border-t-solid border-t-4px border-t-transparent border-r-4px border-r-solid border-r-transparent border-l-4px border-l-solid border-l-#333 transform-scale-x-[-1] transform-scale-y-[-1]"
                />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.91667 5.83324H4.38914C4.78414 5.83324 5.16588 5.69314 5.46672 5.43814L8.54248 2.83235C9.44665 2.06651 10.8341 2.70916 10.8341 3.89416V16.1057C10.8341 17.2907 9.44665 17.9341 8.54248 17.1675L5.46672 14.5617C5.16588 14.3067 4.78414 14.1666 4.38914 14.1666H2.91667C2.22667 14.1666 1.66667 13.6066 1.66667 12.9166V7.08406C1.66667 6.39322 2.22667 5.83324 2.91667 5.83324ZM13.9725 13.9757C15.0383 12.9149 15.625 11.5024 15.625 9.99991C15.625 8.49741 15.0383 7.08491 13.9725 6.02408C13.7275 5.78075 13.3317 5.78071 13.0884 6.02571C12.8442 6.26987 12.8458 6.66657 13.09 6.9099C13.9183 7.7349 14.375 8.83322 14.375 10.0007C14.375 11.1682 13.9183 12.2665 13.09 13.0915C12.8458 13.3349 12.8442 13.7307 13.0884 13.9757C13.21 14.0982 13.3709 14.1599 13.5309 14.1599C13.6909 14.1582 13.85 14.0974 13.9725 13.9757ZM15.8892 16.5166C15.7292 16.5166 15.5683 16.4558 15.4467 16.3333C15.2033 16.0892 15.2033 15.6933 15.4483 15.4491C16.9058 13.9958 17.7083 12.0607 17.7083 9.99991C17.7083 7.93908 16.9058 6.00486 15.4483 4.55069C15.2033 4.30652 15.2033 3.91066 15.4467 3.6665C15.69 3.42233 16.0859 3.42151 16.3309 3.66568C18.025 5.35568 18.9583 7.60574 18.9583 9.99991C18.9583 12.3941 18.025 14.6441 16.3309 16.3341C16.2084 16.4558 16.0492 16.5166 15.8892 16.5166Z"
                  fill="#fff"/>
              </svg>
              {{ history_count }}
            </div>
            <div
              class="flex items-center gap-4px px-8px py-6px rounded-4px h-26px text-12px lh-12px color-#12B886 bg-#12B8861A"
              @mouseenter.stop="showPopover($event,listData[index].actions)"
              @mouseleave.stop="scheduleHide"
            >
              <img class="w-14px h-14px rounded-full" :src="formatIconTag(tag)" alt="">
              {{ action_count }}{{ $t('smart_money_trade') }}{{ $t(tag) }}
            </div>
          </div>
          <div
            v-tooltip="formatDate(signal_time, 'MM/DD HH:mm:ss')"
            class="flex items-center gap-4px color-[--d-666-l-999] hover:color-[--d-F5F5F5-l-333] cursor-pointer"
          >
            <Icon
              name="custom:clock"
              class="text-14px"
            />
            <TimerCount
              v-if="signal_time && Number(formatTimeFromNow(signal_time, true)) < 60"
              :key="signal_time" :timestamp="signal_time" :end-time="60">
              <template #default="{ seconds }">
                <div v-if="seconds < 60" class="color-#FFA622 text-12px">
                  {{ seconds }}s
                </div>
                <div v-else class="text-12px">
                  {{ dayjs(signal_time * 1000).fromNow() }}
                </div>
              </template>
            </TimerCount>
            <div v-else class="text-12px flex">
              {{ dayjs(signal_time * 1000).fromNow() }}
            </div>
          </div>
        </div>
        <div class="flex justify-between mb-18px">
          <div class="flex items-center gap-8px">
            <TokenImg
              token-class="w-36px h-36px"
              chain-class="w-14px h-14px"
              :row="{
              symbol,
               chain,
               logo_url:logo
            }"
            />
            <div>
              <div class="mb-4px flex items-center gap-4px color-[--d-666-l-999]">
                <span class="text-16px font-500 color-[--d-F5F5F5-l-333]">{{ symbol }}</span><span
                v-copy="token"
                class="text-12px cursor-pointer">{{
                  token.slice(0, 4)
                }}...{{ token.slice(-4) }}</span>
                <Icon v-copy="token" name="bxs:copy" class="cursor-pointer text-12px"/>
                <a
                  class="text-10px"
                  :href="`https://x.com/search?q=($${symbol} OR ${token})&src=typed_query&f=live`"
                  target="_blank"
                >
                  <Icon
                    name="hugeicons:search-01"
                  />
                </a>
                <img
                  v-if="issue_platform"
                  v-tooltip="issue_platform"
                  :src="formatIconTag(issue_platform)"
                  width="10"
                  height="10"
                  class="rounded-full"
                  alt=""
                >
              </div>
              <div class="flex items-center gap-8px">
                <TimerCount
                  v-if="token_create_time && Number(formatTimeFromNow(token_create_time, true)) < 60"
                  :key="token_create_time" :timestamp="token_create_time" :end-time="60">
                  <template #default="{ seconds }">
                  <span v-if="seconds < 60" class="color-#FFA622 text-12px">
                    {{ seconds }}s
                  </span>
                    <span v-else class="color-[--d-999-l-666] text-12px">
                    {{ formatTimeFromNow(token_create_time) }}
                  </span>
                  </template>
                </TimerCount>
                <div v-else class="color-[--d-999-l-666] text-12px">
                  {{ formatTimeFromNow(token_create_time) }}
                </div>
                <div
                  v-if="Number(top10_ratio) > 0"
                  class="text-10px flex items-center gap-2px color-[--d-999-l-666]"
                  :class="{
                    'color-#F6465D':Number(top10_ratio) > 30
                }"
                >
                  <Icon
                    class="text-11px"
                    name="custom:top"
                  />
                  {{ formatNumber(top10_ratio || 0, 1) }}%
                </div>
                <div
                  v-if="Number(insider_ratio) > 0"
                  class="text-10px flex items-center gap-2px color-[--d-999-l-666]"
                  :class="{
                    'color-#F6465D':Number(insider_ratio) > 30
                }"
                >
                  <Icon
                    class="text-11px"
                    name="custom:insiders"
                  />
                  {{ formatNumber(insider_ratio || 0, 1) }}%
                </div>
                <div
                  v-if="Number(dev_ratio) > 0.01"
                  class="text-10px flex items-center gap-2px color-[--d-999-l-666]"
                >
                  <img
                    src="@/assets/images/dev.png" alt=""
                    class="w-11px h-11px">
                  {{ formatNumber(dev_ratio || 0, 1) }}%
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-16px">
            <div class="color-[--d-999-l-666] mb-4px">
              {{ $t('MaximumIncrease') }}
            </div>
            <div
              class="p-8px min-w-67px text-center rounded-tl-2 rounded-br-[10px] text-[32px] leading-[24px] text-white font-500 bg-[linear-gradient(73.74deg,_#8B4FDD_9.69%,_#12B886_91.69%)]"
            >
              {{ Number(max_price_change) < 1 ? '<1' : Math.ceil(Number(max_price_change)) + 'X' }}
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center text-12px lh-20px">
          <el-row
            class="flex-1"
          >
            <el-col :span="9">
              <div class="color-[--d-666-l-999]">{{ $t('FirstAlert') }}</div>
              <div class="color-[--d-F5F5F5-l-333]">
                {{
                  first_signal_time
                    ? formatDate(first_signal_time, 'YYYY/MM/DD HH:mm:ss')
                    : '--'
                }}
              </div>
            </el-col>
            <el-col
              :span="11"
              class="[&&]:flex items-center gap-4"
            >
              <div>
                <div class="color-[--d-666-l-999]">
                  {{ $t('AlertMC') }}
                </div>
                <div class="flex items-center color-[--d-F5F5F5-l-333]">
                  ${{ formatNumber(mc, 1) }}
                  <svg
                    class="mx-8px"
                    xmlns="http://www.w3.org/2000/svg" width="9" height="5" viewBox="0 0 9 5" fill="none">
                    <path
                      d="M8.85359 2.85406L6.85396 4.85352C6.75645 4.95102 6.62843 5 6.50042 5C6.37241 5 6.24438 4.95102 6.14688 4.85352C5.95137 4.65803 5.95137 4.342 6.14688 4.14651L7.29344 3.00006H0.500032C0.223514 3.00006 0 2.77606 0 2.50007C0 2.22408 0.223514 2.00008 0.500032 2.00008H7.29344L6.14688 0.853632C5.95137 0.658138 5.95137 0.342115 6.14688 0.146621C6.34239 -0.0488736 6.65844 -0.0488736 6.85396 0.146621L8.85359 2.14608C8.9001 2.19257 8.93662 2.24754 8.96212 2.30904C9.01263 2.43103 9.01263 2.56911 8.96212 2.6911C8.93662 2.7526 8.9001 2.80757 8.85359 2.85406Z"
                      fill="#999999"/>
                  </svg>
                </div>
              </div>
              <div>
                <div class="color-[--d-666-l-999]">
                  {{ $t('CurrentMC') }}
                </div>
                <div class="flex items-center gap-4px color-[--d-F5F5F5-l-333]">
              <span
                :class="{
                'color-#12B886':mc_cur>mc,
                'color-#F6465D':mc_cur<mc,
              }">${{ formatNumber(mc_cur, 1) }}</span>
                  <svg
                    v-if="mc_cur>mc" xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12"
                    fill="none">
                    <path
                      d="M3.49995 11.2642C2.67341 11.2642 2.0031 10.5941 2.0031 9.76732V4.51884L0.562256 4.79659C0.0635865 4.79659 -0.187847 4.19516 0.164385 3.84097L1.16816 2.83719L3.1032 0.902156C3.21464 0.792959 3.35687 0.73584 3.50107 0.73584C3.64331 0.73584 3.78526 0.792679 3.89698 0.902156L5.83202 2.83719L6.8358 3.84097C7.18775 4.19516 6.93632 4.79659 6.43793 4.79659L4.99708 4.51884V9.76732C4.9968 10.5939 4.32677 11.2642 3.49995 11.2642Z"
                      fill="url(#paint0_linear_2064_120)"/>
                    <defs>
                      <linearGradient
                        id="paint0_linear_2064_120" x1="3.49995" y1="10.3486" x2="3.49995" y2="2.38052"
                        gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6BC993"/>
                        <stop offset="1" stop-color="#8FE5B6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg
                    v-else-if="mc_cur<mc" xmlns="http://www.w3.org/2000/svg" width="7" height="12"
                    viewBox="0 0 7 12" fill="none">
                    <path
                      d="M4.9969 2.23269V7.48117L6.43774 7.20342C6.93641 7.20342 7.18785 7.80484 6.83562 8.15904L5.83184 9.16281L3.8968 11.0979C3.78536 11.2071 3.64312 11.2642 3.50089 11.2642C3.35669 11.2642 3.21445 11.2073 3.10302 11.0979L1.16798 9.16281L0.164201 8.15904C-0.187751 7.80484 0.0636836 7.20342 0.562073 7.20342L2.00292 7.48117V2.23269C2.00292 1.40614 2.67295 0.73584 3.49977 0.73584C4.32687 0.73584 4.9969 1.40614 4.9969 2.23269Z"
                      fill="url(#paint0_linear_2075_10442)"/>
                    <defs>
                      <linearGradient
                        id="paint0_linear_2075_10442" x1="3.50033" y1="1.75362" x2="3.50033" y2="9.71048"
                        gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FF395A"/>
                        <stop offset="1" stop-color="#FF697C"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="color-[--d-666-l-999]">
                {{ $t('Holders') }}
              </div>
              <div class="color-[--d-F5F5F5-l-333]">
                {{ formatNumber(holders_cur) }}
              </div>
            </el-col>
          </el-row>
          <QuickSwapButton
            :quick-buy-value="quickBuyValue"
            :row="listData[index]"
            classNames="min-w-70px"
            mainNameVisible
          />
        </div>
        <div v-if="headline" class="flex items-center gap-8px mt-12px">
          <Icon name="custom:ai"/>
          <div class="color-[--d-F5F5F5-l-333] text-12px whitespace-nowrap overflow-hidden text-ellipsis">
            {{ headline }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="listStatus.loading" class="flex justify-center text-12px text-[#959a9f]">{{ $t('loading') }}</div>
  </el-scrollbar>
  <!--  actions -->
  <el-popover
    :width="390"
    :offset="8"
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
