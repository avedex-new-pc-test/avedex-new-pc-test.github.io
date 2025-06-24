<script setup lang="ts">
import TimeLine from './timeLine.vue'

defineProps<{
  activeChain: string
}>()
</script>

<template>
  <TimeLine :activeChain="activeChain"/>
</template>

<style scoped lang="scss">

</style>
