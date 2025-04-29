<template>
  <NuxtPwaAssets />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang='ts'>
  // import { bot_getWalletsAllChain, bot_getWebConfig } from '@/api/bot'
  function init() {
    useConfigStore().getChainConfig()
    useConfigStore().getGlobalConfig()
  }

  onBeforeMount(() => {
    init()
  })

</script>

