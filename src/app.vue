<template>
  <NuxtPwaAssets />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang='ts'>
  function init() {
    useConfigStore().getChainConfig()
    useConfigStore().getGlobalConfig()
  }

  onBeforeMount(() => {
    init()
  })

</script>

