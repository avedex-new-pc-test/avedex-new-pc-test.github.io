<template>
  <div v-if="Number(walletTokenInfo?.balance_usd || 0) > 0" class="max-h-54px flex items-start justify-between color-[--d-F5F5F5-l-333] text-center bg-[--d-222-l-F2F2F2] mb-12px p-10px rd-4px">
    <div class="flex-1">
      <div class="text-11px color-[--d-666-l-999]">{{ $t('bought') }}</div>
      <div class="text-12px mt-5px color-#12B886">${{ formatNumber(walletTokenInfo?.total_purchase_usd || 0, 2) }}</div>
    </div>
    <div class="flex-1">
      <div class="text-11px color-[--d-666-l-999]">{{ $t('sold') }}</div>
      <div class="text-12px mt-5px" :class="[Number(walletTokenInfo?.total_sold_usd || 0) > 0 ? 'color-#F6465D' : 'color-[--d-666-l-999]']">${{ formatNumber(walletTokenInfo?.total_sold_usd || 0, 2) }}</div>
    </div>
    <div class="flex-1">
      <div class="text-11px color-[--d-666-l-999]">{{ $t('holding') }}</div>
      <div class="text-12px  mt-5px">${{ formatNumber(walletTokenInfo?.balance_usd || 0, 2) }}</div>
    </div>
    <div class="flex-1">
      <div class="text-11px color-[--d-666-l-999] flex items-center justify-center">
        <span>{{ $t('profit2') }}</span>
        <Icon name="solar:dollar-bold" class="text-12px clickable" @click.stop="isShowB=!isShowB" />
      </div>
      <div class="text-12px mt-5px" :class="[Number(walletTokenInfo?.total_profit || 0) > 0 ? 'color-#12B886' : 'color-#F6465D']">
        <template v-if="!isShowB">
           ${{ formatNumber(walletTokenInfo?.total_profit || 0, 2) }}
        </template>
         <template v-else>
           {{ formatNumber(Number(walletTokenInfo?.total_profit || 0) / Number(walletTokenInfo?.main_token_price || 1), 2) }} {{ walletTokenInfo?.main_token_symbol || '' }}
        </template>

      </div>
      <div class="text-8px" :class="[Number(walletTokenInfo?.total_profit_ratio || 0) > 0 ? 'color-#12B886' : 'color-#F6465D']">({{ formatNumber(Number(walletTokenInfo?.total_profit_ratio || 0) * 100, 2) }}%)</div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { bot_getUserWalletTxInfo } from '@/api/token'
import type { WalletTokenInfo } from '@/api/types/token'
import { formatNumber } from '@/utils/formatNumber'
import { useEventBus } from '@vueuse/core'
const route = useRoute()
const botStore = useBotStore()
const tokenStore = useTokenStore()
const userAddress = computed(() => {
  const [token, chain] = getAddressAndChainFromId(route.params?.id as string, 1)
  if (!token || !chain) {
    return ''
  }
  return botStore.userInfo?.addresses?.find?.(i => i?.chain === chain)?.address
})

watch(userAddress, (val) => {
  if (val) {
    getWalletTxData()
  }
})

const walletTokenInfo = ref<WalletTokenInfo | null>(null)
async function getWalletTxData() {
  const [token, chain] = getAddressAndChainFromId(route.params?.id as string, 1)
  if (!token || !chain) {
    return
  }
  if (!['solana', 'bsc'].includes(chain)) {
    walletTokenInfo.value = null
    return
  }

  const userAddress = botStore.userInfo?.addresses?.find?.(i => i?.chain === chain)?.address

  if (!userAddress || !token) return

  const params = {
    user_address: userAddress,
    chain: chain,
    user_token: token
  }
  return bot_getUserWalletTxInfo(params).then(async res => {
    walletTokenInfo.value = res?.[0] || null
    const avgPrice = Number(res?.[0]?.balance_amount) > 0 ? Number(res?.[0]?.average_purchase_price_usd || 0) : 0
    useEventBus('updateAvgPrice').emit(avgPrice)
    return res
  }).catch(async () => {
    walletTokenInfo.value = null
    return null
  })
}

watch(() => tokenStore.placeOrderSuccess, () => {
  getWalletTxDataPoll()
})

let time = 0
function getWalletTxDataPoll() {
  if (time > 6) {
    time = 0
    return
  }
  getWalletTxData()
  time++
  setTimeout(getWalletTxDataPoll, 5000)
}

const isShowB = ref(false)

</script>

<style>

</style>
