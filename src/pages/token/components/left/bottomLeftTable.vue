<script setup lang="ts">
import Trending from './trending.vue'
import {useWindowSize} from '@vueuse/core'

const {t} = useI18n()
const props = defineProps({
  topLeftHeight: {
    type: Number,
    required: true
  }
})
const {height} = useWindowSize()
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
const scrollbarHeight = computed(() => {
  const TOPBAR_HEIGHT = 60
  const CHARTTOP_HEIGHT = 64
  return height.value - props.topLeftHeight - TOPBAR_HEIGHT - CHARTTOP_HEIGHT - 122
})
</script>

<template>
  <div
    :class="`bg-[--d-111-l-FFF] rounded-2px text-14px pt-10px flex-1
    `">
    <div class="flex items-center px-12px gap-20px">
      <a
          v-for="(item) in tabs"
          :key="item.component" href="javascript:;"
          :class="`decoration-none text-12px lh-16px pb-8px text-center color-[--d-999-l-666] b-b-solid b-b-2px
         ${activeTab===item.component ? 'color-[--d-E9E9E9-l-222] b-b-[--d-F5F5F5-l-333]':'b-b-transparent'}`"
          @click="activeTab=item.component"
      >
        {{ item.name }}
      </a>
    </div>
    <component :is="Component" :scrollbarHeight="scrollbarHeight"/>
  </div>
</template>

<style scoped>

</style>
