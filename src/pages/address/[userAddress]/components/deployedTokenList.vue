<template>
  <div class="mt_20">
    <el-table
      ref="table_ref"
      :data="tableData"
      :default-sort="{
        prop: conditions.sort,
        order: conditions.sort_dir ? conditions.sort_dir + 'ending' : null,
      }"
      fit
      style="width: 100%"
      class="table-container"
      @row-click="onRowClick"
      @sort-change="handleSortChange"
    >
      <template #empty>
        <AveEmpty v-if="!loading" class="table-empty" />
      </template>
      <TokenColumn
        :column-props="{
          label: $t('walletToken'),
          width: '250',
          fixed: 'left',
        }"
      />
      <el-table-column :label="$t('migrated1')">
        <template #default="{ row }">
          {{ row.migrated }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="['descending', 'ascending', null]"
        :label="$t('walletMarketCap')"
        prop="market_cap"
      >
        <template #default="{ row }"> ${{ formatNumber(row.market_cap, 2) }}</template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="['descending', 'ascending', null]"
        :label="$t('allTimeHigh')"
        prop="all_time_high"
      >
        <template #default="{ row }"> ${{ formatNumber(row.all_time_high, 2) }}</template>
      </el-table-column>
      <el-table-column :label="$t('holders')">
        <template #default="{ row }">
          {{ formatNumber(row.holders || 0, 2) }}
        </template>
      </el-table-column>
      <TotalProfitColumn :label="$t('profit3')" />
      <el-table-column :label="$t('Bonding Curve Progress')">
        <template #default="{ row }">
          <template v-if="!row.progress || row.progress === '--'"> -- </template>
          <el-progress
            v-else
            :percentage="Number(row.progress)"
            :text-inside="true"
            :stroke-width="14"
            color="#FFA622"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import AveEmpty from '@/components/aveEmpty.vue'
import TokenColumn from '@/components/tokenColumn.vue'
import TotalProfitColumn from './totalProfitColumn.vue'
// import { formatNumber2 } from '@/utils/formatNumber'
import type { RowEventHandlerParams } from 'element-plus'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
  handleSortChange: {
    type: Function,
    default: () => {},
  },
  conditions: {
    type: Object,
    default: () => ({}),
  },
})

function onRowClick(row: any, column: any, event: Event) {
  if (!token.value) {
    return
  }
  if (SupportFullDataChain.includes(token.value.chain)) {
    const { symbol, logo_url, chain, token: _token } = token.value
    const {
      target_token,
      token0_address,
      token0_symbol,
      token1_symbol,
      pair: pairAddress,
    } = pair.value!
    tokenDetailSStore.$patch({
      drawerVisible: true,
      tokenInfo: {
        id: route.params.id! as string,
        symbol,
        logo_url,
        chain,
        address: _token,
        remark: rowData.remark!,
      },
      pairInfo: {
        target_token,
        token0_address,
        token0_symbol,
        token1_symbol,
        pairAddress,
      },
      user_address: rowData.wallet_address,
    })
  } else {
    window.open(formatExplorerUrl(token.value.chain, rowData.transaction, 'tx'))
  }
}
</script>

<style scoped lang="scss">
:deep(.el-progress-bar__outer) {
  background-color: var(--el-border-color-lighter);
}

:deep(.el-table) {
  overflow: initial;
  tr th {
    background: #0a0b0d !important;
  }
}
.table-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
  min-height: calc(100vh - 750px);
}
</style>
