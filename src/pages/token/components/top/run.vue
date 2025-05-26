<template>
    <el-drawer
    v-model="visible"
    append-to-body
    :with-header="false"
    :size="430"
    class="draw-right"
  >
  <div>
    1111
  </div>
  </el-drawer>
</template>

<script setup lang="ts">
const { modelValue } = defineProps({
  modelValue: Boolean,
})
const $emit = defineEmits(['update:modelValue'])
const visible = computed({
  get() {
    return modelValue
  },
  set(value) {
    $emit('update:modelValue', value)
  },
})

</script>

