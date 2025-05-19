<template>
  <div class="flex bg-[--d-000-l-F6F6F6] gap-4px pt-4px" style="min-height: calc(100vh - 100px);">
    <div class="flex-1">
      <div class="h-64px bg-green">图表上方</div>
      <div class="flex gap-4px">
        <div class="w-292px bg-red">左侧</div>
        <div class="flex-1">
          <el-scrollbar height="calc(100vh - 152px)">
            <KLine />
            <div class="h-64px bg-orange min-h-300px">图表下方</div>
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
import TokenRight from './components/right/index.vue'
import KLine from '~/pages/token/components/kLine/index.vue'
const route = useRoute()
const tokenStore = useTokenStore()
const wsStore = useWSStore()


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
}

onBeforeMount(() => {
  init()
})

onBeforeRouteLeave(() => {
  tokenStore.reset()
  wsStore.getWSInstance()?.offMessage(['tx_update_token', 'kline'])
})
</script>

<style></style>
