<script setup lang="ts">
defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  }
})
</script>

<template>
  <template v-if="Number(modelValue)===0">0</template>
  <template v-else-if="modelValue==='--'">--</template>
  <slot v-else/>
</template>

<style scoped lang="scss">

</style>
