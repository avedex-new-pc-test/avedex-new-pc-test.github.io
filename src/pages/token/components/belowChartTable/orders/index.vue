<script setup lang="ts">
import { computed, ref } from "vue"

import { useBotStore } from '@/stores/bot'
import { getChainInfo } from '@/utils'
import unified from './unified.vue'
import { cancelAllLimitOrdersByGuid } from "@/api/token"

const botStore = useBotStore()
const { t } = useI18n()
const route = useRoute()

const unifiedRef = ref<any>()
const activeTab = ref('solana')
const botOrderOnlyCurrentToken = ref(false)
const tabs = computed(() => {
  // 获取原始地址数组
  const addresses = botStore.userInfo?.addresses || []
  // 自定义排序，确保 Solana 在第一位，BSC 在第二位
  return [...addresses].sort((a, b) => {
    if (a.chain === 'solana') return -1  // Solana 排在最前面
    if (b.chain === 'solana') return 1
    if (a.chain === 'bsc') return -1     // BSC 排在 Solana 之后
    if (b.chain === 'bsc') return 1
    return 0  // 其他链保持原来的顺序
  })
})

const userAddress = computed(() => {
  const address = botStore.userInfo?.addresses.find((item) => item.chain === activeTab.value)
  return address?.address || ''
})

function setActiveTab(val: string) {
  activeTab.value = val
}
function toggleCurrentToken() {
  botOrderOnlyCurrentToken.value = !botOrderOnlyCurrentToken.value
}

function toggleCancelAll() {
  // 如果没有待处理订单，直接返回
  if (!unifiedRef.value?.txOrder?.length) return
  ElMessageBox.confirm(t('botCancelOrder'), '', {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel')
  })
    .then(async () => {
      await cancelAllLimitOrdersByGuid({
        chain: activeTab.value,
      })
      unifiedRef.value.getUserPendingTx()
    }).catch(() => { })
}

onMounted(() => {
  const chain = String(route.params.id).split('-')[1]
  if (tabs.value.find(i => i?.chain === chain)) {
    activeTab.value = chain
  }
})
</script>

<template>
  <div>
    <div class="px-12px mb-10px flex justify-between">
      <div class="flex items-center whitespace-nowrap w-[80%] overflow-x-auto scrollbar-hide">
        <a
          v-for="(item) in tabs" :key="item.chain" href="javascript:;" :class="`decoration-none shrink-0 text-12px lh-16px text-center color-[--d-999-l-666] px-12px py-4px rounded-4px
          ${activeTab === item.chain ? 'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]' : ''}`"
          @click="setActiveTab(item.chain)">
          {{ getChainInfo(item.chain).name }}
        </a>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="h-6 text-xs rounded border-0 px-2.5 cursor-pointer bg-[rgba(63,128,247,0.10)] text-#3F80F7 whitespace-nowrap"
          :class="[botOrderOnlyCurrentToken && '!bg-[#3F80F7] !text-white']" @click="toggleCurrentToken">
          {{ t('currentToken') }}
        </button>
        <button
          class="h-6 text-xs rounded border-0 px-2.5 cursor-pointer bg-[#222325] text-[#696E7C] whitespace-nowrap"
          :class="[unifiedRef?.txOrder?.length > 0 && '!bg-[#221115] !text-[#F6465D]']" @click="toggleCancelAll">
          {{ t('cancelAll') }}
        </button>
      </div>
    </div>
    <unified ref="unifiedRef" :chain="activeTab" :currentToken="botOrderOnlyCurrentToken" :userAddress="userAddress" />
  </div>
</template>

<style lang="scss" scoped></style>
