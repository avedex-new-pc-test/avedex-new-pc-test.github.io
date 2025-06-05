<script setup lang="ts">
import Transactions from './transactions/transactions.vue'
import OrdersTab from './orders/index.vue'
import OneClick from '../right/botSwap/oneClick.vue'
import { useBotStore } from '@/stores/bot'
const { globalConfig } = storeToRefs(useConfigStore())
const route = useRoute()
const tokenStore = useTokenStore()
const botStore = useBotStore()
const { t } = useI18n()
const {token, tokenInfoExtra } = storeToRefs(useTokenStore())
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
  Holders: defineAsyncComponent(() => import('./holders/index.vue')),
  LP: '',
  Attention: '',
  // Orders: defineAsyncComponent(() => import('./orders/index.vue')),
  MySwap: defineAsyncComponent(() => import('./mySwap/index.vue')),
}

watch(
  () => tokenStore.placeOrderUpdate,
  () => {
    if (activeTab.value !== 'Orders') {
      activeTab.value = 'Orders'
    }
  }
)

watch(
  () => tokenStore.placeOrderSuccess,
  () => {
    if (activeTab.value !== 'MySwap') {
      activeTab.value = 'MySwap'
    }
  }
)

const tabsList = computed(() => {
  return tabs.value.filter(item => {
    if (item.component === 'Orders' && !botStore?.userInfo?.evmAddress) {
      return false
    }
    return true
  })
})

const Component = computed(() => {
  return components[activeTab.value]
})
const holders= computed(()=>{
  return token?.value?.holders || 0
})
const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: token.value?.token || '',
    chain: token.value?.chain || '',
  }
})
const isInsiderOrSniperSupported= computed(()=>{
  const chain = addressAndChain.value.chain
  const chainsSupport =
    globalConfig.value?.chains_support_data_analysis_insider_sniper
  return chainsSupport?.includes(chain) || false

})
</script>

<template>
  <div class="bg-[--d-111-l-FFF] rounded-2px text-14px pt-12px flex-1">
    <div class="flex items-center px-12px gap-20px border-b-1px border-b-solid border-b-#FFFFFF08 mb-12px">
      <a v-for="(item) in tabsList" :key="item.component" href="javascript:;" :class="`flex items-center decoration-none text-12px lh-16px text-center color-[--d-999-l-666]
         ${activeTab === item.component ? 'color-[--d-E9E9E9-l-222] b-b-[--d-F5F5F5-l-333]' : 'b-b-transparent'}`"
        @click="activeTab = item.component">
        <div v-if="item.component == 'Orders'" class="w-1px h-20px bg-[var(--custom-br-1-color)] mr-20px mb-8px"></div>
        <div
          :class="`b-b-solid b-b-2px pb-8px ${activeTab === item.component ? ' b-b-[--d-F5F5F5-l-333]' : 'b-b-transparent'}`">
          {{ item.name }}
          <span v-if="item.component === 'Orders'">({{ tokenStore.registrationNum }})</span>
          <span v-if="item.component == 'Holders' && holders">
            ({{ holders ? formatNumber(holders) : '' }})
              <template v-if="isInsiderOrSniperSupported && isInsiderOrSniperSupported">
                <img class="align-middle"  v-if="tokenInfoExtra?.insiders_balance_ratio_cur??0 > 0.3" src="@/assets/images/insiders.svg" :width="14">
                <img  class="align-middle" v-else src="@/assets/images/insiders-gray.svg" :width="14">
                <template v-if="(tokenInfoExtra?.insiders_balance_ratio_cur ??0) * 100 > 0.1">
                  {{ formatNumber((tokenInfoExtra?.insiders_balance_ratio_cur??0) * 100, 2) + '%' }}
                </template>
                <template v-else-if="(tokenInfoExtra?.insiders_balance_ratio_cur??0) * 100 > 0.01">
                  {{ Number((tokenInfoExtra?.insiders_balance_ratio_cur??0) * 100 || 0)?.toFixed(2) + '%' }}
                </template>
                <template v-else>
                  {{ '&lt;0.01%' }}
                </template>
              </template>
          </span>
        </div>
      </a>
      <OneClick />
    </div>
    <OrdersTab :currentActiveTab="activeTab" v-show="activeTab === 'Orders'" />
    <KeepAlive v-show="activeTab !== 'Orders'">
      <component :is="Component" />
    </KeepAlive>
  </div>
</template>

<style>
.light {
  --custom-br-1-color: #f5f5f5;
}

.dark {
  --custom-br-1-color: #33353D;
}
</style>
<style scoped></style>
