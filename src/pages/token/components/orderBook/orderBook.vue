<template>
  <div v-if="modelValue" class="bg-[--d-111-l-FFF] rounded-2px text-14px pt-12px flex flex-col overflow-hidden" :style="{ height: `${klineHeight || 200}px` }">
    <!-- 标题栏 -->
    <div class="flex items-center px-12px gap-20px mb-12px">
      <div class="flex items-center gap-4px">
        <span class="text-lg color-[--d-E9E9E9-l-222]">{{ t('trades') }}</span>
        <Icon v-show="isPausedTxs" name="custom:stop" class="text-lg" />
      </div>
      <div class="flex-1" />
      <div class="flex items-center gap-8px">
        <button
          class="me-btn flex items-center gap-4px"
          :class="{ 'active': isMeActive }"
          @click="toggleClickMe"
        >
          <Icon name="i-tdesign:user-filled" class="text-md" />
          <span>{{ t('me') }}</span>
        </button>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="px-12px mb-10px">
      <div class="flex items-center gap-8px overflow-x-auto scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'shrink-0 text-12px px-12px py-4px rounded-4px border-none cursor-pointer',
            activeTab === tab.value
              ? 'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]'
              : 'bg-transparent color-[--d-999-l-666]'
          ]"
          @click="setActiveTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="px-12px">
      <div v-loading="listStatus.loadingTxs" class="text-12px">
        <!-- 表格头部 -->
        <div class="grid grid-cols-4 gap-8px py-8px border-b-1px border-b-solid border-b-[rgba(255,255,255,.03)] text-12px color-[--d-999-l-666]">
          <div class="text-left flex items-center gap-2px">
            {{ t('amount') }} 
            <Icon name="i-f7:money-dollar-circle-fill" class="text-md"/>
          </div>
          <div class="text-center">{{ t('price') }}</div>
          <div class="text-center">{{ t('makers') }}</div>
          <div class="text-right">{{ t('time') }}</div>
        </div>

        <!-- 表格内容 -->
        <el-scrollbar
          style="margin-right: -12px;padding-right: 12px;"
          :height="`${(klineHeight ?? 200) - 120}px`"
        >
          <div
            v-for="(row, index) in filterTableList.slice(0, 50)"
            :key="index"
            class="grid grid-cols-4 gap-8px py-2 hover:bg-[rgba(255,255,255,.02)] cursor-pointer"
            @mouseenter="isPausedTxs = true"
            @mouseleave="isPausedTxs = false"
            @click="onRowClick(row)"
          >
            <!-- Amount -->
            <div class="text-left">
              <div :class="getRowColor(row)" class="font-medium">
                ${{ formatNumber(getAmount(row, true, true), 2) }}
              </div>
            </div>

            <!-- Price -->
            <div class="text-center">
              <div class="color-[--d-E9E9E9-l-222]">
                ${{ formatNumber(getPrice(row), 4) }}
              </div>
            </div>

            <!-- Trader -->
            <div class="text-center">
              <div class="flex items-center justify-center gap-4px">
                <UserRemark
                  :remark="row.remark"
                  :address="row.wallet_address"
                  :chain="row.chain"
                  :wallet_logo="row.wallet_logo"
                  class="color-[--d-E9E9E9-l-222]"
                  :mouseoverAddress="e => openMarkerTooltip(row, e)"
                  :canEdit="false"
                  @update-remark="updateRemark"
                />
              </div>
            </div>

            <!-- Time -->
            <div class="text-right">
              <div class="color-[--d-999-l-666]">
                <TimerCount
                  v-if="row.time && Number(formatTimeFromNow(row.time, true)) < 60"
                  :key="row.time"
                  :timestamp="row.time"
                  :end-time="60"
                >
                  <template #default="{seconds}">
                    <span>
                      <template v-if="seconds < 60">
                        {{ seconds }}{{ t('ss') }}
                      </template>
                      <template v-else>
                        {{ dayjs(row.time * 1000).fromNow() }}
                      </template>
                    </span>
                  </template>
                </TimerCount>
                <span v-else>
                  {{ dayjs(row.time * 1000).fromNow() }}
                </span>
              </div>
            </div>
          </div>
          <template v-if="filterTableList.length === 0">
            <div class="h-full flex flex-col items-center justify-center ">
              <img src="@/assets/images/empty-black.svg" alt="">
            </div>
          </template>
        </el-scrollbar>
      </div>
    </div>

    <!-- MarkerTooltip -->
    <MarkerTooltip
      :virtual-ref="makerTooltip"
      :currentRow="currentRow"
      :addressAndChain="addressAndChain"
    >
      <template v-if="currentRow.senderProfile">
        <Icon
          v-if="hasNewAccount(currentRow)"
          v-tooltip.raw="`<span style='color: #85E12F'>${$t('newTokenAccount')}</span>`"
          name="custom:new-account"
          class="mr-3px"
        />
        <Icon
          v-if="hasClearedAccount(currentRow)"
          v-tooltip.raw="`<span style='color: #EB2B4B'>${$t('sellAl')}</span>`"
          name="custom:cleared-account"
          class="mr-3px"
        />
        <Icon
          v-if="bigWallet(currentRow)"
          v-tooltip.raw="`<span style='color: #C5842B'>${$t('whales')}</span>`"
          name="custom:big"
          class="mr-3px"
        />
      </template>
      <SignalTags
        tagClass="mr-3px"
        :tags="currentRow.newTags"
        :walletAddress="currentRow.wallet_address"
        :chain="currentRow.chain"
      />
    </MarkerTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, onMounted, onUnmounted, triggerRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useTokenStore } from '~/stores/token'
import { useWSStore } from '~/stores/ws'
import { getPairTxs, type GetPairTxsResponse } from '~/api/token'
import { getAddressAndChainFromId, formatTimeFromNow, getWSMessage } from '~/utils'
import { useRoute } from 'vue-router'
import { filterLanguage } from '~/pages/token/components/kLine/utils'
import { WSEventType } from '~/utils/constants'
import { useThrottleFn } from '@vueuse/core'
import UserRemark from '~/components/userRemark.vue'
import MarkerTooltip from '../belowChartTable/transactions/markerTooltip.vue'
import TimerCount from '~/components/timerCount.vue'
import dayjs from 'dayjs'
import { ElScrollbar } from 'element-plus'

// const MAKER_SUPPORT_CHAINS = ['solana', 'bsc']

// 扩展的交易数据类型
type ExtendedTxResponse = GetPairTxsResponse & {
  count?: number
  senderProfile?: any
  wallet_tag?: string[]
  topN?: string
  remark?: string
}

const props = defineProps<{
  modelValue: boolean
  klineHeight?: number
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const route = useRoute()
const { totalHolders, pairAddress, token } = storeToRefs(useTokenStore())

const wsStore = useWSStore()

// 状态管理
const activeTab = shallowRef('all')
const isPausedTxs = shallowRef(false)
const isMeActive = ref(false)
const listStatus = ref({
  loadingTxs: false
})
const pairTxs = shallowRef<ExtendedTxResponse[]>([])
const wsPairCache = shallowRef<ExtendedTxResponse[]>([])
const tableFilter = ref({
  markerAddress: '',
  tag_type: ''
})
const txCount = shallowRef<{ [key: string]: number }>({})
const makerTooltip = ref()
const currentRow = shallowRef<ExtendedTxResponse>({} as any)


const tabs = computed(() => {
  const arr: Array<{ label: string, value: string }> = []
  if (Array.isArray(totalHolders.value)) {
    totalHolders.value.forEach(i => {
      const num = i.total_address
      if (num > 0) {
        arr.push({
          ...i,
          label: i?.[filterLanguage(useLocaleStore().locale)] + (i.type !== '31' ? `(${num})` : ''),
          value: i.type
        })
      }
    })
  }
  return [{
    label: t('all'),
    value: 'all'
  },
  {
    label: 'Smarter',
    value: 'smarter'
  },
  ...arr]
})

const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: token.value?.token || '',
    chain: token.value?.chain || ''
  }
})

const filterTableList = computed(() => {
  let tableList = [...pairTxs.value]

  // 根据 activeTab 筛选
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'smarter') {
      // 智能钱包筛选逻辑
      tableList = tableList.filter(item => item.wallet_tag_v2?.includes('smart'))
    } else {
      // 其他标签筛选
      tableList = tableList.filter(item => item.wallet_tag_v2?.includes(activeTab.value))
    }
  }

  // Maker 地址筛选
  if (tableFilter.value.markerAddress) {
    tableList = tableList.filter(item =>
      item.wallet_address.toLowerCase() === tableFilter.value.markerAddress.toLowerCase()
    )
  }

  return tableList
})

// 监听 pairAddress 变化
watch(() => pairAddress.value, () => {
  if (pairAddress.value && props.modelValue) {
    txCount.value = {}
    _getPairTxs()
    subscribeToTxs()
  }
})

// 监听 modelValue 变化（orderBook 打开/关闭）
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && pairAddress.value) {
    // orderBook 打开时，获取数据并订阅
    txCount.value = {}
    _getPairTxs()
    subscribeToTxs()
  } else if (!isOpen) {
    // orderBook 关闭时，取消订阅
    unsubscribeFromTxs()
  }
})

// WebSocket 订阅
function subscribeToTxs() {
  const liqParams = {
    jsonrpc: '2.0',
    params: ['tx', pairAddress.value],
    id: 1
  }
  wsStore.send({
    ...liqParams,
    method: 'unsubscribe'
  })
  wsStore.send({
    ...liqParams,
    method: 'subscribe'
  })
}

// WebSocket 取消订阅
function unsubscribeFromTxs() {
  const liqParams = {
    jsonrpc: '2.0',
    params: ['tx', pairAddress.value],
    id: 1
  }
  wsStore.send({
    ...liqParams,
    method: 'unsubscribe'
  })
}

async function _getPairTxs() {
  try {
    listStatus.value.loadingTxs = true
    const { tag_type } = tableFilter.value
    const getPairTxsParams = {
      pair: pairAddress.value + '-' + addressAndChain.value.chain,
      tag_type
    }
    const res = await getPairTxs(getPairTxsParams)
    pairTxs.value = (res || []).reverse().map(val => {
      txCount.value[val.wallet_address] = (txCount.value[val.wallet_address] || 0) + 1
      const { wallet_tag, topN } = getWalletTag(val)
      return {
        ...val,
        wallet_tag,
        topN,
        count: txCount.value[val.wallet_address],
        senderProfile: JSON.parse(val.profile || '{}')
      }
    }).reverse()
  } catch (e) {
    console.log('Error fetching pair txs:', e)
  } finally {
    listStatus.value.loadingTxs = false
  }
}

function getWalletTag(val: GetPairTxsResponse) {
  const wallet_tagStr = val.wallet_tag_v2 || ''
  let topN = ''
  let wallet_tag: string[] = []
  if (wallet_tagStr.length > 0) {
    wallet_tag = wallet_tagStr.split(',')
    wallet_tag.forEach((i: string, index: number) => {
      const isTopN = new RegExp('^top.*$', 'gi').test(i)
      if (isTopN) {
        topN = i
        wallet_tag.splice(index, 1)
      }
    })
  }
  return {
    topN,
    wallet_tag
  }
}

function isBuy(row: GetPairTxsResponse) {
  if (row.from_address &&
      addressAndChain.value.address.toLowerCase?.() === row.from_address?.toLowerCase?.()) {
    return false
  }
  if (row.to_address &&
      addressAndChain.value.address.toLowerCase?.() === row.to_address.toLowerCase?.()) {
    return true
  }
  return false
}

function getRowColor(row: GetPairTxsResponse) {
  return isBuy(row) ? 'color-#12B886' : 'color-#FF646D'
}

function getPrice(row: GetPairTxsResponse) {
  const tokenAddress = addressAndChain.value.address
  if (row.from_address &&
      tokenAddress.toLowerCase?.() === row.from_address?.toLowerCase?.()) {
    return row.from_price_usd
  }
  if (row.to_address &&
      tokenAddress.toLowerCase?.() === row.to_address?.toLowerCase?.()) {
    return row.to_price_usd
  }
  return 0
}

function getAmount(row: GetPairTxsResponse, needPrice = false, isVolUSDT = false) {
  if (row.from_address &&
      addressAndChain.value.address.toLowerCase?.() === row.from_address?.toLowerCase?.()) {
    return row.from_amount * (
      needPrice ? Number(isVolUSDT ? row.from_price_usd : row.from_price_eth) : 1
    )
  }
  if (row.to_address &&
      addressAndChain.value.address.toLowerCase?.() === row.to_address?.toLowerCase?.()) {
    return row.to_amount * (
      needPrice ? Number(isVolUSDT ? row.to_price_usd : row.to_price_eth) : 1
    )
  }
  return 0
}



function setActiveTab(val: string) {
  activeTab.value = val
  txCount.value = {}
  tableFilter.value.tag_type = val
  _getPairTxs()
}

function toggleClickMe() {
  if (isMeActive.value) {
    isMeActive.value = false
    tableFilter.value.markerAddress = ''
  } else {
    isMeActive.value = true
    tableFilter.value.markerAddress = addressAndChain.value.address
  }
}


function onRowClick(row: GetPairTxsResponse) {
  // 处理行点击事件
  console.log('Row clicked:', row)
}

function updateRemark() {
  // 更新备注后的回调
}

function openMarkerTooltip(row: ExtendedTxResponse, e: MouseEvent) {
  if (row) {
    makerTooltip.value = e.currentTarget
    if (currentRow.value?.wallet_address === row.wallet_address) {
      return
    }
    currentRow.value = row
  }
}



function hasNewAccount(row: ExtendedTxResponse) {
  if (row?.newTags?.some?.(i => i?.type === '8')) {
    return false
  }
  if (
    addressAndChain.value.address.toLowerCase?.() === row.senderProfile?.token0Address?.toLowerCase?.()
  ) {
    return row.senderProfile?.token0HasNewAccount
  } else {
    return row.senderProfile?.token1HasNewAccount
  }
}

function hasClearedAccount(row: ExtendedTxResponse) {
  if (isBuy(row) || row.newTags?.some?.(i => i?.type === '8')) {
    return false
  }
  if (
    addressAndChain.value.address.toLowerCase?.() === row.senderProfile?.token0Address?.toLowerCase?.()
  ) {
    return row.senderProfile?.token0HasClearedAccount
  } else {
    return row.senderProfile?.token1HasClearedAccount
  }
}

function bigWallet(row: ExtendedTxResponse) {
  if (row?.newTags?.some?.(i => i.type === '8')) {
    return false
  }
  return Number(row.senderProfile?.solTotalHolding) > 50
}

// WebSocket 相关功能
onMounted(() => {
  onTxsLiqMessage()
  // 如果组件挂载时 orderBook 已经打开，则获取数据
  if (props.modelValue && pairAddress.value) {
    _getPairTxs()
    subscribeToTxs()
  }
})

onUnmounted(() => {
  wsStore.getWSInstance()?.offMessage('tx_history')
  // 组件卸载时取消订阅
  if (pairAddress.value) {
    unsubscribeFromTxs()
  }
})

function onTxsLiqMessage() {
  wsStore.getWSInstance()?.onmessage(e => {
    const msg = getWSMessage(e)
    if (!msg || !props.modelValue) {
      return  // 只有当 orderBook 打开时才处理消息
    }

    const {event, data} = msg
    if (event == WSEventType.TX && !listStatus.value.loadingTxs) {
      const {wallet_address} = data.tx
      txCount.value[wallet_address] = (txCount.value[wallet_address] || 0) + 1
      const {topN, wallet_tag} = getWalletTag(data.tx)
      const item = {
        ...data.tx,
        topN, wallet_tag,
        senderProfile: JSON.parse(data.tx.profile || '{}'),
        count: txCount.value[wallet_address]
      }
      wsPairCache.value.unshift(item)
      console.log(isPausedTxs.value)
      if (!isPausedTxs.value) {
        updatePairTxs()
      }
    }
  }, 'tx_history')
}

const updatePairTxs = useThrottleFn(() => {
  pairTxs.value.unshift(...wsPairCache.value)
  wsPairCache.value.length = 0
  triggerRef(pairTxs)
}, 500)

</script>

<style lang="scss" scoped>
.me-btn {
  color: var(--primary-color);
  background: rgba($color: #3F80F7, $alpha: 0.1);
  display: flex;
  align-items: center;
  border: none;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;

  &.active {
    background: var(--primary-color);
    color: #fff;
  }
}
</style>
