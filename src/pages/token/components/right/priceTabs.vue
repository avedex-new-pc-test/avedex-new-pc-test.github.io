<template>
  <div class="tabs">
    <button
      v-for="item in tabs"
      :key="item.id"
      class="tab-button clickable-btn"
      :class="{ active: modelValue === item.id }"
      @click="$emit('update:modelValue', item.id)"
    >
      <div class="name">{{ item.name }}</div>
      <div class="value" :style="{ color: getColor(item.id) }">
        {{!!pair ? formatNumber(pair?.[`price_change_${item?.id}`]) : '--' }}%
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Pair } from '@/api/types/token'
import { formatNumber } from '@/utils/formatNumber'
const props = defineProps<{
  modelValue: string
  tabs: { id: '5m' | '1h' | '4h' | '24h'; name: string }[]
  pair: Pair | null
}>()

const $emit = defineEmits(['update:modelValue'])


const getColor = (id: string) => {
  const val = props.pair?.[`price_change_${id}` as 'price_change_5m' | 'price_change_1h' | 'price_change_4h' | 'price_change_24h']
  if(!val) return '#999'
  if (val > 0) return '#12B886'
  if (val < 0) return '#F6465D'
  return '#999'
}
</script>

<style scoped lang="scss">
  .tabs {
    display: flex;
    align-items: center;
     background: var(--d-222-l-F2F2F2);
    .tab-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      background: var(--d-222-l-F2F2F2);
      flex: 1;
      min-height: 44px;
      color: var(-d-333-l-F5F5F5);
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      &:last-child {
        border-radius: 0 4px 4px 0;
      }
      .name {
        font-size: 11px;
      }
      .value {
        font-size: 12px;
        margin-top: 2px;
      }
      &.active {
        background: var(--d-333-l-DDD);
        color: var(--custom-text-1-color);
      }
    }
  }
</style>
