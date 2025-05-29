<template>
  <div>
    <el-table v-loading="loading && !txOrder?.length" :data="txOrder" fit stripe max-height="700"
      style="width: 100%; min-height: 450px;" @row-click="tableRowClick">
      <template #empty>
        <div v-if="!loading" class="flex flex-col items-center justify-center py-30px">
          <img v-if="mode === 'light'" src="@/assets/images/empty-white.svg">
          <img v-if="mode === 'dark'" src="@/assets/images/empty-black.svg">
          <span>{{ t('emptyNoData') }}</span>
        </div>
        <span v-else />
      </template>
      <el-table-column :label="t('token')" align="left">
        <template #default="{ row }">
          <div class="flex items-center justify-start">
            <div class="icon-token-container mr-5px">
              <div class="relative">
                <el-image class="w-32px h-32px rounded-full" :src="getSymbolDefaultIcon({
                  chain: row?.chain,
                  symbol: row.swapType === 2 || row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol,
                  logo_url: row.swapType === 2 || row.swapType === 6 ? row?.inTokenLogoUrl : row.outTokenLogoUrl
                })">
                  <template #error>
                    <img class="w-32px h-32px"
                      :src="getChainDefaultIcon(row?.chain, !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol)"
                      alt="" srcset="">
                  </template>
                  <template #placeholder>
                    <img class="w-32px h-32px"
                      :src="getChainDefaultIcon(row?.chain, !row?.isBuy ? row?.inTokenSymbol : row.outTokenSymbol)"
                      alt="" srcset="">
                  </template>
                </el-image>
                <img v-if="row?.chain" class="w-12px h-12px absolute bottom-3px right-3px"
                  :src="`${configStore.token_logo_url}chain/${row.chain}.png`" alt="" srcset="">
              </div>
            </div>
            <span class="text-[var(--d-eaecef-l-333333)] text-13px">{{ !row?.isBuy ? row?.inTokenSymbol :
              row.outTokenSymbol
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="t('type')" align="right" prop="isBuy" width="100px">
        <template #header>
          <span>{{ t('type') }}</span>
          <el-dropdown trigger="click" @command="handleTypeCommand">
            <Icon name="custom:filter" class="color-[--d-666-l-999] cursor-pointer text-10px mt-7px" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ t('all') }}</el-dropdown-item>
                <el-dropdown-item command="5">{{ t('limitBuy') }}</el-dropdown-item>
                <el-dropdown-item command="6">{{ t('limitSell') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="{ row }">
          <span v-if="row.swapType === 6" class="text-13px text-[#F6465D] px-5px py-2px rounded-4px bg-[#221115]">
            {{ t('limit') }}/{{ t('sell') }}
          </span>
          <span v-if="row.swapType === 5" class="text-13px text-[#12B886] px-5px py-2px rounded-4px bg-[#0b1d19]">
            {{ t('limit') }}/{{ t('buy') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="t('price')" align="right">
        <template #header>
          <span>{{ t('price') }}</span>
        </template>
        <template #default="{ row }">
          <span class="text-[var(--d-999-l-959A9F)]">${{ formatNumber(row?.PriceLimit || 0) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('volume4')" align="right">
        <template #default="{ row }">
          <span class="text-[var(--d-999-l-959A9F)]">{{ formatNumber(Number(row?.inValue) || 0, 2) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="t('amount1')" align="right">
        <template #header>
          <span>{{ t('amountB') }}</span>
          <!-- <i v-if="!isUnit" @click="isUnit = !isUnit"
            class="iconify i-custom:u text-10px ml-3px color-[--d-666-l-999] cursor-pointer text-12px"></i>
          <i v-else @click="isUnit = !isUnit"
            class="iconify i-custom:b text-10px ml-3px color-[--d-666-l-999] cursor-pointer text-12px"></i> -->
        </template>
        <template #default="{ row }">
          <span class="text-[var(--d-999-l-959A9F)]">
            <template v-if="!row?.isBuy">
              {{ !!Number(row?.inAmount) ? formatNumber(new BigNumber(row?.inAmount || 0).div(new
                BigNumber(10).pow(row.inTokenDecimals || 0)).toFixed(), 4) : '--' }}
              <span v-if="isUnit" class="color-[--d-999-l-666]">
                &nbsp;{{ getChainInfo(row.chain)?.main_name }}
              </span>
            </template>
            <template v-else>
              {{ !!Number(row?.outputAmount) ? formatNumber(new BigNumber(row?.outputAmount || 0).div(new
                BigNumber(10).pow(row.outTokenDecimals || 0)).toFixed(), 4) : '--' }}
              <span v-if="isUnit" class="color-[--d-999-l-666]">
                &nbsp;{{ getChainInfo(row.chain)?.main_name }}
              </span>
            </template>
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="t('status')" align="right">
        <template #header>
          <span>{{ t('status') }}</span>
          <!-- <el-dropdown trigger="click" @command="handleStatusCommand">
            <i class="iconify i-custom:filter text-10px color-[--d-666-l-999] cursor-pointer text-10px"></i>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="全部">全部</el-dropdown-item>
                <el-dropdown-item command="挂单中">挂单中</el-dropdown-item>
                <el-dropdown-item command="部分成交">部分成交</el-dropdown-item>
              </el-dropdown-menu>
            </template>
  </el-dropdown> -->
        </template>
        <template #default="{ row }">
          <span v-if="row.status === 'confirmed'" class="text-[var(--d-999-l-959A9F)]">{{ t('completed') }}</span>
          <span v-else-if="row.status === 'cancelled'" class="text-[var(--d-999-l-959A9F)]">{{ t('cancelled1') }}</span>
          <span v-else-if="row.status === 'sent'" class="text-[var(--d-999-l-959A9F)]">{{ t('sent') }}</span>
          <span v-else-if="row.status === 'waiting'" class="text-[var(--d-999-l-959A9F)]">{{ t('pendingOrder') }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="t('CreateTime')" align="right">
        <template #default="{ row }">
          <span class="color-[--d-999-l-666]">{{ formatDate(row.createTime, 'YYYY/MM/DD HH:mm') }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="t('ExpirationTime')" align="right">
        <template #default="{ row }">
          <span class="color-[--d-999-l-666]">{{ formatDate(new Date(row.createTime).getTime() + 7 * 24 * 60 * 60 *
            1000,
            'YYYY/MM/DD HH:mm') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('operate')" align="right">
        <template #default="{ row }">
          <div v-if="row.status === 'waiting'" class="text-[#F6465D] text-14px cursor-pointer"
            @click.stop="handleCancelOrder(row)">
            {{ t('cancel') }}
          </div>
          <div v-else>
            -
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
// import { useStorage } from '@vueuse/core'
import BigNumber from 'bignumber.js'
import { formatDate, getChainDefaultIcon, formatExplorerUrl } from '~/utils'
import { formatNumber } from '~/utils/formatNumber'
import { bot_getUserPendingTx, bot_cancelLimitOrdersByBatch } from '@/api/token'

import { ref } from 'vue'

const props = defineProps({
  chain: {
    type: String,
    required: true
  },
  currentToken: {
    type: Boolean,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  }
})

const tokenStore = useTokenStore()
const route = useRoute()
const { mode } = storeToRefs(useGlobalStore())
const { t } = useGlobalStore()
const configStore = useConfigStore()
const filterConditions = ref({
  swapType: ['buy', 'sell'],
  statusType: ['waiting', 'confirmed', 'error', 'cancelled', 'sent']
})

const txOrder = ref([])
const loading = ref(false)
const isUnit = ref(true)

watch([() => props.chain, () => props.currentToken, () => tokenStore.placeOrderUpdate], () => {
  getUserPendingTx()
})

function handleCancelOrder(row: any) {
  ElMessageBox.confirm(t('botCancelOrder'), '', {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel')
  })
    .then(async () => {
      console.log(row)
      await bot_cancelLimitOrdersByBatch({
        chain: props.chain,
        batchId: row.batchId
      })
      getUserPendingTx()
    }).catch(() => { })
}
function handleTypeCommand(command: string) {
  if (command === 'all') {
    filterConditions.value.swapType = ['buy', 'sell']
  } else if (command === '5') {
    filterConditions.value.swapType = ['buy']
  } else if (command === '6') {
    filterConditions.value.swapType = ['sell']
  }
}

// function handleStatusCommand(command: string) {
//   if (command === '全部') {
//     filterConditions.value.statusType = ['waiting', 'confirmed', 'error', 'cancelled', 'sent']
//   } else if (command === '挂单中') {
//     filterConditions.value.statusType = ['waiting']
//   } else if (command === '部分成交') {
//     filterConditions.value.statusType = ['confirmed']
//   }
//   // this.handleFilterConfirm(this.filterForm['statusType']);
// }

function tableRowClick(row: any) {
  if (!row.txHash) return
  window.open(formatExplorerUrl(row.chain, row.txHash, 'tx'))
}

const getUserPendingTx = async () => {
  loading.value = true
  try {
    const data = {
      chain: props.chain,
      token: props.currentToken ? String(route.params.id).split('-')[0] : '',
      walletAddress: props.userAddress,
    }
    const res = await bot_getUserPendingTx({
      ...data
    })
    txOrder.value = res || []
    tokenStore.registrationNum = txOrder.value.length
  } catch (error: any) {
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getUserPendingTx()
})
defineExpose({
  txOrder,
  getUserPendingTx,
})
</script>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu) {
  background-color: var(--custom-bg-1-color);
  border: 1px solid var(--d-33353D-l-f5f5f5);
}

:deep(.el-table) {
  --el-table-tr-bg-color: #0A0B0D;
  --el-table-bg-color: #0A0B0D;
  --el-table-text-color: var(--d-222-l-F2F2F2);
  --el-table-header-bg-color: var(--d-17191C-l-F2F2F2);
  --el-fill-color-lighter: #0A0B0D;
  --el-table-header-text-color: var(--d-999-l-666);
  --el-table-border-color: var(--d-33353D-l-f5f5f5);
  --el-table-row-hover-bg-color: var(--d-333333-l-eaecef);
  background: #0A0B0D;
  --el-bg-color: #0A0B0D;
  --el-table-border: 0.5px solid var(--d-33353D-l-f5f5f5);
  font-size: 13px;

  th {
    padding: 6px 0;
    border-bottom: none !important;
    height: 32px;

    &.el-table__cell.is-leaf {
      border-bottom: none;
    }

    .cell {
      font-weight: 400;
      font-size: 12px;
    }
  }
}
</style>
