<script setup lang="ts">
import Trending from './trending.vue'
import {templateRef} from '@vueuse/core'

defineProps({
  height: {
    type: Number,
    default: 100
  }
})
const {t} = useI18n()
// const leftBottomBox = templateRef('leftBottomBox')
// const {height} = useElementSize(leftBottomBox)
const activeTab = shallowRef<keyof typeof components>('Trending')
const tabs = shallowRef([
  {name: t('trending'), component: 'Trending' as const},
  {name: 'Pump', component: 'Pump' as const},
])
const tabsToHeight = {
  Trending: 240,
  Pump: 290
}
const components = {
  Trending,
  Pump: defineAsyncComponent(() => import('./pump.vue'))
}
const Component = computed(() => {
  return components[activeTab.value]
})
// const scrollbarHeight = computed(() => {
//   if (leftBottomBox.value) {
//     return leftBottomBox.value.clientHeight - 76
//   }
//   return 0
// })
</script>

<template>
  <div class="bg-[--d-111-l-FFF] rounded-2px text-14px pt-10px flex-1 flex flex-col">
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
    <KeepAlive>
      <component
        :is="Component"
        class="flex-1 relative"
        :scrollbarHeight="height - tabsToHeight[activeTab]"/>
    </KeepAlive>
  </div>
</template>

<style scoped>

</style>
