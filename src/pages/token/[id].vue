<template>
  <div class="flex bg-[--d-000-l-F6F6F6] gap-4px pt-4px" style="min-height: calc(100vh - 100px);">
    <div class="flex-1">
      <div class="h-64px bg-green">图表上方</div>
      <div class="flex gap-4px">
        <div class="w-292px">
          <Left/>
        </div>
        <div class="flex-1">
          <div class="h-400px bg-yellow">图表</div>
          <div class="h-64px bg-orange min-h-300px">图表下方</div>
        </div>
      </div>
    </div>
    <TokenRight class="w-334px" />
  </div>
</template>

<script setup lang='ts'>
import { getTokenInfo, getTokenInfoExtra } from '~/api/token'
import { useTokenStore } from '~/stores/token'
import TokenRight from './components/right/index.vue'
import {Left} from './components/left'
const route = useRoute()
const tokenStore = useTokenStore()

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
}

onBeforeMount(() => {
  init()
})

onBeforeRouteLeave(() => {
  tokenStore.reset()
})
</script>

<style></style>
