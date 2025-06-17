<script setup lang="ts">
import { ref } from 'vue'
import Symbol from './components/symbol/index.vue'

// const { t } = useI18n()
const activeTab = ref('symbol')

const tabs = ref([{
  label: '自选币种',
  value: 'symbol'
}, {
  label: '关注地址',
  value: 'address'
}])

const setActiveTab = (val: string) => {
  activeTab.value = val
}
</script>

<template>
  <div>
    <div class="flex items-center pl-12px pt-12px gap-8px">
      <div v-for="(item) in tabs" :key="item.value"
        class="cursor-pointer text-14px color-[--d-999-l-666] bg-[--d-15171c-l-f2f2f2] px-12px py-8px rounded-4px"
        :class="[activeTab === item.value && 'bg-[--d-333-l-0A0B0C] color-[#F5F5F5]']"
        @click="setActiveTab(item.value)">
        {{ item.label }}
      </div>
    </div>

    <Symbol v-if="activeTab === 'symbol'" />
  </div>
</template>

<style lang="scss" scoped></style>
