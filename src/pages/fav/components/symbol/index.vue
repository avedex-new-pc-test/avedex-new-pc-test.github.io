<script setup lang="ts">
import { ref } from 'vue'

const { t } = useI18n()
const activeTab = ref('symbol')

const tabs = ref([{
  label: '自选币种',
  value: 'symbol'
}, {
  label: '关注地址',
  value: 'address'
}])

const loading = ref(false)
const pageData = ref({
  total: 10,
  page: 1,
  pageSize: 10
})
const tableList = ref([1, 2])
const { mode } = storeToRefs(useGlobalStore())

const setActiveTab = (val: string) => {
  activeTab.value = val
}
</script>

<template>
  <div>
    <div class="flex items-center p-12px gap-8px overflow-x-auto scrollbar-hide">
      <div v-for="(item) in tabs" :key="item.value"
        class="cursor-pointer text-12px color-[--d-999-l-666] bg-[--d-15171c-l-f2f2f2] px-8px py-4px rounded-4px shrink-0"
        :class="[activeTab === item.value && 'bg-[--d-333-l-0A0B0C] color-[#F5F5F5]']"
        @click="setActiveTab(item.value)">
        {{ item.label }}
      </div>
    </div>

    <el-table v-loading="loading" :data="tableList" fit>
      <template #empty>
        <div v-if="!loading" class="flex flex-col items-center justify-center py-30px">
          <img v-if="mode === 'light'" src="@/assets/images/empty-white.svg">
          <img v-if="mode === 'dark'" src="@/assets/images/empty-black.svg">
          <span>{{ t('emptyNoData') }}</span>
        </div>
        <span v-else />
      </template>
      <el-table-column :label="t('volume4')" align="right">
        <template #default="{ row }">
          <div class="text-[var(--d-999-l-959A9F)] text-right">${{ formatNumber(Number(row?.inValue) || row?.outValue ||
            0, 2) }}</div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="mt-20px" v-model:current-page="pageData.page" v-model:page-size="pageData.pageSize"
      layout="prev, sizes, pager, next, jumper, ->" :total="pageData.total" :page-sizes="[10, 20, 30, 40, 50, 60]" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-pagination) {
  justify-content: center;
}
</style>
