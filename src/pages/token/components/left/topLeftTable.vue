<script setup lang="ts">
import FavoriteTable from './favoriteTable.vue'

const {t} = useI18n()
defineProps({
  height: [Number, String]
})
const activeTab = shallowRef<keyof typeof components>('FavoriteTable')
const tabs = shallowRef([
  {name: t('favorites'), url: '', component: 'FavoriteTable' as const},
  {name: t('positions'), url: '', component: 'PositionsTable' as const},
  // {name: t('attention1'), url: '', component: 'MyAttentionTable' as const},
])
const components = {
  FavoriteTable,
  PositionsTable: defineAsyncComponent(() => import('./positionsTable.vue')),
  // MyAttentionTable: defineAsyncComponent(() => import('./myAttentionTable.vue'))
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
    <component :is="Component" :height="height"/>
  </div>
</template>

<style scoped>

</style>
