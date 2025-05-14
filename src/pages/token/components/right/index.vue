<template>
  <div>
    <div class="p-15px bg-[--d-111-l-FFF]">
      <PriceTabs v-model="tabActive" :pair="tokenStore.pair" :tabs="tabs" />
      <VolumeStats :tabActive="tabActive" :tabActiveName="tabActiveName" :pair="pair" />
    </div>
    <!-- <div class="flex items-center justify-around color-[--d-F5F5F5-l-333] p-15px bg-[--d-111-l-FFF] mt-4px">
      <div class="text-center">
        <div class="text-14px mb-5px">${{ formatNumber(token?.open_price || 0, 3) }}</div>
        <div class="text-12px color-[--d-666-l-999]">{{ $t('openPrice') }}</div>
      </div>
       <div class="text-center">
         <div class="text-14px mb-5px">{{ tokenStore.circulation?.gt?.(0) ? (formatNumber(((tokenStore?.tokenInfoExtra?.amount_24 || 0) / Number(tokenStore?.circulation.toFixed())) * 100 || 0, 2) + '%') : '-' }}</div>
        <div class="text-12px color-[--d-666-l-999]">{{ $t('24Exchange') }}</div>
      </div>
      <div class="text-center">
        <div class="text-14px mb-5px">-</div>
        <div class="text-12px color-[--d-666-l-999]">DEV</div>
      </div>
    </div> -->
    <div class="p-15px bg-[--d-111-l-FFF]">
      <Pairs />
    </div>

  </div>
</template>

<script setup lang='ts'>
  import { useLocalStorage, type RemovableRef } from '@vueuse/core'
  import PriceTabs from './priceTabs.vue'
  import VolumeStats from './volumeStats.vue'
  import Pairs from './pairs.vue'
  import { useTokenStore } from '~/stores/token'
  const tokenStore = useTokenStore()
  const tabs: { id: '5m' | '1h' | '4h' | '24h'; name: string }[] = [
    { id: '5m', name: '5M' },
    { id: '1h', name: '1H' },
    { id: '4h', name: '4H' },
    { id: '24h', name: '24H' },
  ]
  const tabActive = useLocalStorage('token_tab_active', '24h') as RemovableRef<'5m' | '1h' | '4h' | '24h'>
  const tabActiveName = tabs.find(i => i.id === tabActive.value)?.name || ''
  const pair = computed(() => tokenStore.pair)
  const token = computed(() => tokenStore.token)

</script>

<style>

</style>
