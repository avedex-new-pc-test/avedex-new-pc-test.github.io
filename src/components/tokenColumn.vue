<template>
  <el-table-column v-bind="columnProps">
    <template #default="{ row }">
      <div
        class="token-info table-item_d flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
        @click.stop.prevent="tableRowClick(row)"
      >
        <div class="icon-token-container relative flex mr-2">
          <TokenImg
            :row="{
              logo_url: `${s3BaseUrl}${row?.logo_url}`,
              chain: row.chain || row.network,
              symbol: row.symbol,
            }"
            token-class="w-8 h-8"
          />
          <img
            v-if="row?.network || row?.chain"
            :src="`${s3BaseUrl}chain/${row.chain}.png`"
            alt=""
            class="icon-symbol absolute max-w-3 w-full h-3 left-4.5 z-10 top-3.25 rounded-full border border-[var(--custom-primary-lighter-0-color)] bg-[var(--custom-primary-lighter-0-color)]"
            onerror="this.src='/icon-default.png'"
            srcset=""
          >
        </div>
        <div>
          <div class="flex items-start">
            <span class="token-symbol ellipsis text-sm mr-0.75">
              {{ row.symbol }}
            </span>
            <i
              v-if="row.risk_score > 55 || row.risk_level < 0"
              class="iconfont icon-danger text-red text-3.5 ml-0.5"
            />
          </div>
          <div class="flex items-start mt-0.5 min-w-[110%]" @click.stop="() => {}">
            <span class="token-address text-xs text-gray-600">
              {{ row.token.slice(0, 4) + '...' + row.token.slice(-6) }}
              <Icon v-copy="row.token" name="bxs:copy" class="mb--0.25 text-2.5 clickable"/>
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
