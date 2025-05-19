<template>
  <NuxtPwaAssets />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang='ts'>
  import { useRemarksStore } from '@/stores/remarks'


  // import { bot_getWalletsAllChain, bot_getWebConfig } from '@/api/bot'
  function init() {
    useConfigStore().getChainConfig()
    useConfigStore().getGlobalConfig()
    useBotStore().getUserInfo()
    useRemarksStore().initRemarks()
  }

  onBeforeMount(() => {
    init()
  })

</script>

