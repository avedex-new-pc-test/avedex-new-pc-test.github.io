<template>
  <div class="flex bg-[--d-000-l-F6F6F6] gap-4px pt-4px w-100%" style="min-height: calc(100vh - 100px);">
    <div class="flex-1 min-w-0">
      <Top/>
      <div class="flex gap-4px">
        <Left class="w-292px flex flex-col flex-shrink-0"/>
        <div class="flex-1 hide-scrollbar min-w-0">
          <el-scrollbar height="calc(100vh - 172px)">
            <KLine />
            <BelowChartTable class="min-h-300px rounded-4px bg-[--d-000-l-F6F6F6]"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <TokenRight class="w-334px flex-shrink-0" />
  </div>
</template>

<script setup lang='ts'>
import { getTokenInfo, getTokenInfoExtra } from '~/api/token'
import { useTokenStore } from '~/stores/token'
import Top from './components/top/index.vue'
import TokenRight from './components/right/index.vue'
import {Left} from './components/left'
import {BelowChartTable} from './components/belowChartTable'
import KLine from '~/pages/token/components/kLine/index.vue'

definePageMeta({
  name: 'token-id',
  key: (route) => {
    return (route.name as string)
  },
})
const route = useRoute()
const tokenStore = useTokenStore()
const botStore = useBotStore()
const addresses = computed(() => {
  const result = botStore.userInfo?.addresses
  if (Array.isArray(result)) {
    return Array.from(new Set(result.map(el => el.address)))
  }
  return []
})
const wsStore = useWSStore()


const documentVisible = shallowRef(true)
provide('documentVisible', documentVisible)
const botSwapStore = useBotSwapStore()

watch(() => addresses.value, () => {
  if (addresses.value?.length) {
    subBalanceChange()
  }
}, {
  immediate: true
})

function subBalanceChange() {
  wsStore.send({
    jsonrpc: '2.0',
    method: 'unsubscribe',
    params: [
      'asset'
    ],
    id: 1
  })
  wsStore.send({
    jsonrpc: '2.0',
    method: 'subscribe',
    params: ['asset', addresses.value],
    id: 1,
  })
}


function _getTokenInfo() {
  const id = route.params.id as string
  getTokenInfo(id).then(res => {
    tokenStore.tokenInfo = res
    tokenStore.pairAddress = res?.pairs?.[0].pair || ''
  })
}

function _getTokenInfoExtra() {
  const id = route.params.id as string
  getTokenInfoExtra(id).then(res => {
    tokenStore.tokenInfoExtra = res
  })
}

function init() {
  tokenStore.tokenPrice = 0
  _getTokenInfo()
  _getTokenInfoExtra()
  // wsStore.onmessageTxUpdateToken()
  tokenStore._getTotalHolders()
  botSwapStore.sendNativePriceWs()
}

watch(() => route.params.id, () => {
  init()
})

function visibilitychangeFn() {
  console.log(`页面是否隐藏: ${document.hidden}`)
  documentVisible.value = (!document.hidden || document.visibilityState === 'visible')
}

onBeforeMount(() => {
  init()
  document.addEventListener('visibilitychange', visibilitychangeFn)
})

onBeforeRouteLeave(() => {
  tokenStore.reset()
  wsStore.getWSInstance()?.offMessage(['tx_update_token', 'kline', 'price'])
  document.removeEventListener('visibilitychange', visibilitychangeFn)
})
</script>

<style>
.hide-scrollbar {
  > .el-scrollbar {
    .el-scrollbar__bar {
      --at-apply: hidden;
    }
  }
}
</style>
