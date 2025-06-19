<template>
  <div>
    <div :style="botStore.connectVisible&&[{filter: 'url(#blur)'}]">
      <TheHeader />
      <div class="flex">
        <Signal/>
        <slot/>
      </div>
      <TheFooter />
    </div>
    <svg v-if="botStore.connectVisible" width="0" height="0" class="absolute">
      <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </svg>
  </div>
</template>

<script setup lang='ts'>
  import TheHeader from '@/components/layouts/TheHeader.vue'
  import TheFooter from '@/components/layouts/TheFooter.vue'
  const botStore = useBotStore()
</script>

<style>

</style>
