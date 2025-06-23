<template>
  <el-table-column v-bind="columnProps">
    <template #default="{ row }">
      <div
        class="token-info table-item_d"
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        @click.stop.prevent="tableRowClick(row)"
      >
        <div class="icon-token-container" style="margin-right: 10px">
          <el-image :src="$f.formatIcon(row, row.symbol)" class="token-icon">
            <template #error>
              <div
                :style="{ background: $f.getChainDefaultIconColor(row?.chain) }"
                class="token-icon"
                style="line-height: 32px; text-align: center; font-size: 16px; color: #fff"
              >
                {{ row.symbol?.slice(0, 1)?.toUpperCase?.() || '' }}
              </div>
            </template>
            <template #placeholder>
              <div
                :style="{ background: $f.getChainDefaultIconColor(row?.chain) }"
                class="token-icon"
                style="line-height: 32px; text-align: center; font-size: 16px; color: #fff"
              >
                {{ row.symbol?.slice(0, 1)?.toUpperCase?.() || '' }}
              </div>
            </template>
          </el-image>
          <img
            v-if="row?.network || row?.chain"
            :src="`${$store.state.s3BaseUrl}chain/${row.chain}.png`"
            alt=""
            class="icon-svg icon-symbol"
            onerror="this.src='/icon-default.png'"
            srcset=""
          />
        </div>
        <div>
          <div class="flex-start">
            <span class="token-symbol ellipsis">
              {{ row.symbol }}
            </span>
            <i
              v-if="row.risk_score > 55 || row.risk_level < 0"
              class="iconfont icon-danger font-14 ml-2"
            />
          </div>
          <div class="font-1 mt-2 flex-start" style="min-width: 110%" @click.stop="() => {}">
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

<script>
export default {
  name: 'TokenColumn',
  props: {
    columnProps: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    tableRowClick(row) {
      this.$router.push({
        name: 'Token',
        params: { id: row.token + '-' + row.chain },
        query: { from: this.$route.name },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.token-address {
  gap: 4px;
  font-size: 12px;
  color: var(--d-666-l-959a9f);

  .iconfont {
    font-size: 10px;
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
