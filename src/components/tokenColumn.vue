<template>
  <el-table-column v-bind="columnProps">
    <template #default="{ row }">

      <div
        class="flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
        @click.stop.prevent="tableRowClick(row)"
      >
        <div class="mr-10px">
          <TokenImg
            :row="{
              logo_url: row.logo_url ? `${s3BaseUrl}${row.logo_url}`:'',
              chain: row.chain || row.network,
              symbol: row.symbol,
            }"
            token-class="w-32px h-32px"
          />
        </div>
        <div>
          <div class="flex items-center">
            <span
              class="mr-3px max-w-100px whitespace-nowrap overflow-hidden text-ellipsis lh-17px color-[--d-F5F5F5-l-333]">
              {{ row.symbol }}
            </span>
            <Icon
              v-if="row.risk_score > 55 || row.risk_level < 0"
              name="custom:danger"
              class="text-14px ml-2px color-#F72121"/>
          </div>
          <div class="flex items-center mt-2px lh-18px" style="min-width: 110%" @click.stop="() => {}">
            <span class="text-12px color-[--d-666-l-999]">
              {{ row.token.slice(0, 4) + '...' + row.token.slice(-6) }}
              <Icon v-copy="row.token" name="bxs:copy" class="mb--1px text-[10px] cursor-pointer"/>
            </span>
          </div>
        </div>
        <slot :row="row" />
      </div>
    </template>
  </el-table-column>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
// import UserAvatar from '@/components/userAvatar.vue'
const configStore = useConfigStore()
const s3BaseUrl = configStore.token_logo_url

const props = defineProps({
  columnProps: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const route = useRoute()

const tableRowClick = (row) => {
  router.push({
    name: 'token-id',
    params: { id: row.token + '-' + row.chain },
    query: { from: route.name },
  })
}
</script>

<style lang="scss" scoped>
</style>
