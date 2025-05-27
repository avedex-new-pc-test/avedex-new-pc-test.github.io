<script setup lang="ts">
import Transactions from './transactions/transactions.vue'
import OneClick from '../right/botSwap/oneClick.vue'
import { useBotStore } from '@/stores/bot'

const tokenStore = useTokenStore()
const botStore = useBotStore()
const { t } = useI18n()
const activeTab = shallowRef<keyof typeof components>('Transactions')
const tabs = shallowRef([
  { name: t('transactions'), component: 'Transactions' as const },
  { name: t('holders'), component: 'Holders' as const },
  { name: 'LP', component: 'LP' as const },
  { name: t('attention1'), component: 'Attention' as const },
  { name: t('orders'), component: 'Orders' as const },
  { name: t('mySwap'), component: 'MySwap' as const },
])
const components = {
  Transactions,
  Holders: defineAsyncComponent(() => import('./holders.vue')),
  LP: '',
  Attention: '',
  Orders: defineAsyncComponent(() => import('./orders/index.vue')),
  MySwap: defineAsyncComponent(() => import('./mySwap/index.vue')),
}

const tabsList = computed(() => {
  return tabs.value.filter(item => {
    if (item.component === 'Orders' && !botStore?.userInfo?.evmAddress) {
      // return false
    }
    return true
  })
})

const Component = computed(() => {
  return components[activeTab.value]
})
</script>

<template>
  <div :class="`bg-[--d-111-l-FFF] rounded-2px text-14px pt-12px flex-1
    `">
    <div
      class="flex items-center px-12px gap-20px border-b-1px border-b-solid border-b-[rgba(255,255,255,.03)] mb-12px">
      <a v-for="(item) in tabsList" :key="item.component" href="javascript:;" :class="`decoration-none text-12px lh-16px pb-8px text-center color-[--d-999-l-666] b-b-solid b-b-2px
         ${activeTab === item.component ? 'color-[--d-E9E9E9-l-222] b-b-[--d-F5F5F5-l-333]' : 'b-b-transparent'}`"
        @click="activeTab = item.component">
        {{ item.name }}
        <span v-if="item.component === 'Orders'">[{{ tokenStore.registrationNum }}]</span>
      </a>
      <OneClick />
    </div>
    <component :is="Component" />
  </div>
</template>

<style scoped></style>
