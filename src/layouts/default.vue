<template>
  <div class="flex items-center">
    <div>
      <TheHeader />
      <slot />
      <TheFooter />
    </div>

  </div>
</template>

<script setup lang='ts'>
  import TheHeader from '@/components/layouts/TheHeader.vue'
  import TheFooter from '@/components/layouts/TheFooter.vue'
</script>

<style>

</style>
