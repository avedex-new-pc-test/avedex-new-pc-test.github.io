<script setup lang="ts">
const {t} = useI18n()
const activeTab = shallowRef()
const tabs = computed(() => {
  return [{
    label: t('all'),
    value: 'all'
  },
    {
      label: t('buy3'),
      value: 'buy'
    },
    {
      label: t('sell3'),
      value: 'sell'
    },
    {
      label: t('followed'),
      value: '-100'
    },
    {
      label: t('liquidity2'),
      value: 'liquidity'
    },]
})
const columns = computed(() => {
  return [{}]
})
</script>

<template>
  <div>
    <div class="flex items-center px-12px mb-10px">
      <a
        v-for="(item) in tabs"
        :key="item.value" href="javascript:;"
        :class="`decoration-none text-12px lh-16px pb-8px text-center color-[--d-999-l-666] px-12px py-4px rounded-4px
         ${activeTab===item.value ? 'bg-[--d-F2F2F2-l-222]':''}`"
        @click="activeTab=item.value"
      >
        {{ item.label }}
      </a>
    </div>
    <AveTable
      :columns="columns"
    />
  </div>
</template>

<style scoped>

</style>
