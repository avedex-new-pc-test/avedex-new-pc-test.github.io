<script setup lang="ts">
import Trending from './trending.vue'

const {t} = useI18n()
defineProps({
  height: Number
})
const activeTab = shallowRef<keyof typeof components>('Trending')
const tabs = shallowRef([
  {name: t('trending'), url: '', component: 'Trending' as const},
  {name: 'Pump', url: '', component: 'Pump' as const},
])
const components = {
  Trending,
  Pump: defineAsyncComponent(() => import('./pump.vue'))
}
const Component = computed(() => {
  return components[activeTab.value]
})
</script>

<template>
  <div
      :class="`background-[var(--d-111-l-fff)] rounded-2px text-14px pt-10px
    `">
    <div class="flex items-center px-12px gap-20px">
      <a
          v-for="(item) in tabs"
          :key="item.component" href="javascript:;"
          :class="`decoration-none text-12px lh-16px pb-8px text-center color-[var(--d-999-l-666)] b-b-solid b-b-2px
         ${activeTab===item.component ? 'color-[var(--d-E9E9E9-l-222)] b-b-[var(--d-F5F5F5-l-333)]':'b-b-transparent'}`"
          @click="activeTab=item.component"
      >
        {{ item.name }}
      </a>
    </div>
    <component :is="Component"/>
  </div>
</template>

<style scoped>

</style>
