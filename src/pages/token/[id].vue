<template>
  <div class="flex bg-[--d-000-l-F6F6F6] gap-4px pt-4px" style="min-height: calc(100vh - 100px);">
    <div class="flex-1">
      <Top/>
      <div class="flex gap-4px">
        <Left class="w-292px flex flex-col"/>
        <div class="flex-1 hide-scrollbar">
          <el-scrollbar height="calc(100vh - 152px)">
            <KLine />
            <BelowChartTable class="min-h-300px rounded-4px bg-[--d-000-l-F6F6F6]"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <TokenRight class="w-334px" />
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
const route = useRoute()
const tokenStore = useTokenStore()
const wsStore = useWSStore()


const documentVisible = shallowRef(true)
provide('documentVisible', documentVisible)

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
  _getTokenInfo()
  _getTokenInfoExtra()
  wsStore.onmessageTxUpdateToken()
  tokenStore._getTotalHolders()
}

onBeforeMount(() => {
  init()
  document.addEventListener('visibilitychange', () => {
    console.log(`页面是否隐藏: ${document.hidden}`)
    documentVisible.value = (!document.hidden || document.visibilityState === 'visible')
  })
})

onBeforeRouteLeave(() => {
  tokenStore.reset()
  wsStore.getWSInstance()?.offMessage(['tx_update_token', 'kline'])
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
