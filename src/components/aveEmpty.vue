<script setup lang="ts">
const themeStore = useThemeStore()
</script>

<template>
  <div class="flex items-center justify-center flex-col">
    <img
      v-if="themeStore.isDark"
      src="@/assets/images/empty-black.svg" alt="">
    <img
      v-else
      src="@/assets/images/empty-white.svg" alt="">
    <slot>
    </slot>
  </div>
</template>

<style scoped>

</style>
