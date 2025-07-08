<template>
  <div>
    <Tabs v-model:activeTab="swapStore.activeTab" />
    <Swap />
  </div>
</template>

<script setup lang='ts'>
import Tabs from './tabs.vue'
import Swap from './swap.vue'
const walletStore = useWalletStore()
const swapStore = useSwapStore()
const tokenStore = useTokenStore()

watch([() => tokenStore.token?.token || '', () => walletStore.chain], () => {
  if (tokenStore.token?.token) {
    swapStore.init()
  }
})

watch(() => () => walletStore.address, () => {
  if (walletStore.address && tokenStore.token?.token) {
    swapStore.getTokenDetails()
  }
})


onMounted(() => {
  swapStore.init()
})

</script>

<style>

</style>
