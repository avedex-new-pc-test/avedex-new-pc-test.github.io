<template>
  <el-table-column v-bind="columnProps">
    <template #default="{ row }">

      <div
        class="token-info table-item_d"
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        @click.stop.prevent="tableRowClick(row)"
      >
        <div class="icon-token-container" style="margin-right: 5px">
          <UserAvatar
            :wallet_logo="{
              name:row?.symbol,
              logo:`${s3BaseUrl}${row?.logo_url}`,
              url:`${s3BaseUrl}${row?.logo_url}`,
            }"
            :address="address"
            :chain="chain"
            iconSize="32px"
          />
          <img
            v-if="row?.network || row?.chain"
            :src="`${s3BaseUrl}chain/${row.chain}.png`"
            alt=""
            class="icon-svg icon-symbol"
            onerror="this.src='/icon-default.png'"
            srcset=""
          >
        </div>
        <div>
          <div class="flex-start">
            <span class="token-symbol ellipsis">
              {{ row.symbol }}
            </span>
            <i
              v-if="row.risk_score > 55 || row.risk_level < 0"
              class="iconfont icon-danger font-14 ml-[2px]"
            />
          </div>
          <div class="flex-start" style="min-width: 110%" @click.stop="() => {}">
            <span class="token-address">
              {{ row.token.slice(0, 4) + '...' + row.token.slice(-6) }}
              <i v-copy="row.token" class="iconfont icon-copy" />
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
import UserAvatar from '@/components/userAvatar.vue'
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
    name: 'Token',
    params: { id: row.token + '-' + row.chain },
    query: { from: route.name },
  })
}
</script>

<style lang="scss" scoped>
.token-address {
  font-size: 12px;
  color: #666;
  margin-top: -5px;
  .iconfont {
    font-size: 10px;
  }
}
.icon-token-container {
  position: relative;
  margin-right: 8px;
  display: flex;
  .token-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
  .icon-symbol {
    position: absolute;
    max-width: 12px;
    width: 100%;
    height: 12px;
    left: 18px;
    z-index: 1;
    top: 13px;
    border-radius: 100%;
    border: 1px solid var(--custom-primary-lighter-0-color);
    background: var(--custom-primary-lighter-0-color);
  }
}

.token-info {
  display: flex;
  align-items: center;

  .icon-symbol {
    top: auto;
    left: auto;
    right: 0;
    bottom: 0;
  }

  .token-symbol {
    font-size: 14px;
    margin-right: 3px;
  }

  .token-icon {
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }
  .icon-danger {
    color: red;
  }
}
</style>
