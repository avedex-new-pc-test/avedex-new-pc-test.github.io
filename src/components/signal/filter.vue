<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: '1'
  }
})
const emit = defineEmits(['update:modelValue'])
const shouldAlert = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div class="flex items-center color-[--d-999-l-666]">
    <Icon
      name="custom:filter"
      class="mr-8px text-12px"
    />
    <Icon
      name="icon-park-solid:volume-notice"
      class="mr-4px"
    />
    <el-switch
      size="small"
      v-model="shouldAlert"
      active-value="1"
      inactive-value="0"/>
  </div>
</template>

<style scoped lang="scss">

</style>
