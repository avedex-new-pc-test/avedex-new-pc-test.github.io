<template>
  <span
    :class="{
      positive: Number(props.value) > 0,
      negative: Number(props.value) < 0,
    }"
  >
    {{ Number(props.value) > 0 ? '+' : '' }}{{ Number(props.value) < 0 ? '-' : '' }}{{ props.signVisible ? '$' : ''}}
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  value: {
    type: [String, Number],
    default: 0,
  },
  signVisible: Boolean,
})
</script>

<style scoped lang="scss">
span {
  color: var(--d-666-l-959A9F);
  &.positive {
    color: var(--color-teal-300);
  }

  &.negative {
    color: var(--color-red-500);
  }
}
</style>
