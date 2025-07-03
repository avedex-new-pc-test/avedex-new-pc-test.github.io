<template>
  <button 
    class="order-book-btn ml-auto clickable" 
    :class="{ 'active': modelValue }" 
    @click.stop="$emit('update:modelValue', !modelValue)"
  >
    <Icon 
      name="i-codicon:layout-sidebar-left"       
      :class="{ 'rotate-90': !modelValue }"
    />
    <span class="ml-5px">{{ $t('orderBook') }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.order-book-btn {
  color: var(--primary-color);
  background: rgba(63, 128, 247, 0.1);
  display: flex;
  align-items: center;
  border: none;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.order-book-btn.active {
  background: var(--primary-color);
  color: #fff;
}
</style>
