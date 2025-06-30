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
      @row-click="jumpBalance"
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
        <template #default="{ row }"> ${{ formatNumber2(row.market_cap, 2, 4, 4) }} </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="['descending', 'ascending', null]"
        :label="$t('allTimeHigh')"
        prop="all_time_high"
      >
        <template #default="{ row }">
          ${{ formatNumber2(row.all_time_high, 2, 4, 4) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('holders')">
        <template #default="{ row }">
          {{ formatNumber2(row.holders || 0, 2, 4, 10 ** 4) }}
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

<script setup>
import AveEmpty from '@/components/aveEmpty.vue'
import TokenColumn from '@/components/tokenColumn.vue'
import TotalProfitColumn from './totalProfitColumn.vue'
import { formatNumber2 } from '@/utils/formatNumber'
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

const jumpBalance = (row) => {
  if (row.chain === 'solana') {
    // store.commit('setShowPopTokenDetails', !store.state.showPopTokenDetails)
    // store.commit(
    //   'setTokenUserAddress',
    //   route.params?.userAddress ||
    //     store.state?.bot?.userInfo?.addresses?.find?.((i) => i?.chain === 'solana')?.address ||
    //     store.state.currentAccount
    // )
    // store.commit('setTokenUser', {
    //   id: row.token + '-' + row.chain,
    //   symbol: row.symbol,
    //   logo_url: row.logo_url,
    //   chain: row.chain,
    //   address: '',
    //   remark: '',
    // })
  } else {
    // Assuming tableRowClick is a method that needs to be emitted
    emit('table-row-click', row)
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
