<template>
  <div class="w-full h-full">
    <!-- <loading
      v-model:active="loading"
      :can-cancel="false"
      loader="dots"
      :opacity="0.2"
      :backgroundColor="$store.state.mode==='light'? '#F5F5F5':'#131722'"
      color="#3F80F7"
      :is-full-page="false"
    /> -->
    <el-table :data="currentUserTokenList" w-full @row-click="tableRowClick">
      <template #empty>
        <AveEmpty v-if="!loading && allUserTokenList.length===0" class="pt-40px"/>
      </template>
      <el-table-column prop="address" :label="$t('token')">
        <template #default="{ row }">
          <div class="token-info flex items-center">
            <div class="icon-token-container">
              <el-image class="token-icon mr-3px" :src="$f.formatIcon(row, row.symbol)" lazy>
                <template #error>
                  <img class="token-icon" :src="formatDefaultIcon(row, row.symbol)" >
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="formatDefaultIcon(row, row.symbol)" >
                </template>
              </el-image>
              <!-- <img
                class="icon-svg icon-symbol"
                :src="`${$store.state.s3BaseUrl}chain/${row?.network || row?.chain}.png`"
                alt=""
                srcset=""
              > -->
            </div>
            <span class="token-symbol whitespace-nowrap overflow-hidden text-ellipsis">{{ row.symbol }}</span>
            <span
              v-if="row.risk_score > 55 || row.risk_level < 0"
              class="risk-status inline-block text-10px border border-current rounded-20px px-5px py-2px text-12px text-[#f72121]"
            >
              {{ $t('highRisk') }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('price')">
        <template #default="{ row }">
          <span v-if="row.price > 0" v-html="'$' + formatNumber3(row.price || 0)"/>
          <span v-else>'-.-'</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('amount')">
        <template #default="{ row }">{{ $formatNumber2(row.amount) }}</template>
      </el-table-column>
      <el-table-column prop :label="$t('value')">
        <template #default="{ row }">
          <span v-if="row.price">${{ formatNumber2(row.amount * row.price) }}</span>
          <span v-else>-.-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import AveEmpty from '@/components/aveEmpty.vue'
const props = defineProps({
  isHide: {
    type: Boolean,
    default: true
  }
})

// const loading = ref(false)
// const tableList = ref([
//   { price: 111, symbol: 111 },
//   { price: 111, symbol: 111 }
// ])

const allUserTokenList = computed(() => {
  return []
})

const currentUserTokenList = computed(() => {
  return props.isHide
    ? allUserTokenList.value?.filter(row => row.amount * row.price >= 1)
    : allUserTokenList.value
})

const tableRowClick = (row) => {
  router.push({
    name: 'Token',
    params: { id: row.id + '-' + row.chain },
    query: { from: route.name }
  })
}
</script>

<style>
:deep(.el-table) {
  font-size: 14px;
  background: var(--custom-primary-lighter-0-color);
  min-height: calc(100vh - 200px);
}

:deep(.el-table tr) {
  background: var(--custom-primary-lighter-0-color);
  cursor: pointer;
  height: 50px;
}

:deep(.el-table tr:hover td.el-table__cell) {
  background-color: var(--custom-primary-lighter-2-color);
}

:deep(.el-table .cell) {
  line-height: 15px;
}

:deep(.el-table th) {
  background: var(--custom-primary-lighter-0-color);
  border-bottom: none;
}

:deep(.el-table th.el-table__cell.is-leaf) {
  border-bottom: none;
}

:deep(.el-table th .cell) {
  color: #848e9c;
  font-weight: 400;
}

:deep(.el-table td.el-table__cell) {
  padding: 8px 0;
  border-bottom: 1px solid var(--custom-td-border-1-color);
  font-weight: 500;
}

:deep(.el-table td .cell) {
  color: var(--custom-font-1-color);
}

:deep(.el-table td:nth-child(2)),
:deep(.el-table td:nth-child(3)),
:deep(.el-table td:nth-child(4)),
:deep(.el-table th:nth-child(2)),
:deep(.el-table th:nth-child(3)),
:deep(.el-table th:nth-child(4)) {
  text-align: right;
}

a {
  color: #3f80f7;
}

.red {
  color: rgb(255, 100, 109);
}

.green {
  color: rgb(70, 215, 171);
}
</style>
