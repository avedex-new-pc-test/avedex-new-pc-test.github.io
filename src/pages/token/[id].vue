<template>
  <div>xxxx</div>
</template>

<script setup lang='ts'>
import { getTokenInfo, getTokenInfoExtra } from '~/api/token'
import { useTokenStore } from '~/stores/token'
const route = useRoute()
const tokenStore = useTokenStore()

function _getTokenInfo() {
  const id = route.params.id as string
  getTokenInfo(id).then(res => {
    tokenStore.tokenInfo = res
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

<style>

</style>
