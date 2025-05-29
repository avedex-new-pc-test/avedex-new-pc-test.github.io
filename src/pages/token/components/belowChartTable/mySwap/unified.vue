<template>
  <div>
    <el-table v-loading="loading && !txHistory?.length" :data="txHistory" fit stripe max-height="700"
      style="width: 100%; min-height: 350px;" @row-click="tableRowClick">
      <template #empty>
        <div class="flex flex-col items-center justify-center py-30px" v-if="!loading">
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
                      :src="getChainDefaultIcon(row?.chain, row.swapType === 2 || row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol)"
                      alt="" srcset="">
                  </template>
                  <template #placeholder>
                    <img class="w-32px h-32px"
                      :src="getChainDefaultIcon(row?.chain, row.swapType === 2 || row.swapType === 6 ? row?.inTokenSymbol : row.outTokenSymbol)"
                      alt="" srcset="">
                  </template>
                </el-image>
                <img v-if="row?.chain" class="w-12px h-12px absolute bottom-3px right-3px"
                  :src="`${configStore.token_logo_url}chain/${row.chain}.png`" alt="" srcset="">
              </div>
            </div>
            <span class="text-[var(--custom-font-1-color)] text-13px">{{ row.swapType === 2 || row.swapType === 6 ?
              row?.inTokenSymbol :
              row.outTokenSymbol
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="t('type')" align="right" prop="isBuy">
        <template #header>
          <span>{{ t('type') }}</span>
          <el-dropdown trigger="click" @command="handleTypeCommand">
            <Icon name="custom:filter" class=" color-[--d-666-l-999] cursor-pointer text-10px mt-5px" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ t('all') }}</el-dropdown-item>
                <el-dropdown-item command="LimitSell">{{ t('limit') }}/{{ t('sell') }}</el-dropdown-item>
                <el-dropdown-item command="LimitBuy">{{ t('limit') }}/{{ t('buy') }}</el-dropdown-item>
                <el-dropdown-item command="MarketSell">{{ t('market') }}/{{ t('sell') }}</el-dropdown-item>
                <el-dropdown-item command="MarketBuy">{{ t('market') }}/{{ t('buy') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="{ row }">
          <div v-if="row.swapType === 1 || row.swapType === 5" class="text-13px text-[#12B886] px-8px rounded-4px">
            {{ row.swapType === 1 ? t('market') : t('limit') }}/{{ t('buy') }}
          </div>
          <div v-if="row.swapType === 2 || row.swapType === 6" class="text-13px text-[#F6465D] px-8px rounded-4px">
            {{ row.swapType === 2 ? t('market') : t('limit') }}/{{ t('sell') }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('price')" align="right">
        <template #default="{ row }">
          <div class="text-[var(--d-999-l-959A9F)] text-right">${{ row?.swapType === 1 ? formatNumber(row?.outPrice ||
            0) : formatNumber(row?.inPrice || 0) }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="t('volume4')" align="right">
        <template #default="{ row }">
          <div class="text-[var(--d-999-l-959A9F)] text-right">${{ formatNumber(Number(row?.inValue) || row?.outValue ||
            0, 2) }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="t('amount1')" align="right">
        <template #header>
          <span>{{ t('amount1') }}</span>
          <!-- <span @click="isUnit = !isUnit"
            class="iconify i-custom:u text-10px ml-3px color-[--d-666-l-999] cursor-pointer text-12px"></span>
          <span @click="isUnit = !isUnit"
            class="iconify i-custom:b text-10px ml-3px color-[--d-666-l-999] cursor-pointer text-12px"></span> -->
        </template>
        <template #default="{ row }">
          <span class="text-[var(--d-999-l-959A9F)] text-right">
            <template v-if="!row?.isBuy">
              {{ formatNumber(new BigNumber(row?.inAmount || 0).div(new BigNumber(10).pow(row.inTokenDecimals ||
                0)).toFixed(), 4) }} {{ row?.inTokenSymbol }}
            </template>
            <template v-else>
              {{ formatNumber(new BigNumber(row?.outAmount || 0).div(new BigNumber(10).pow(row.outTokenDecimals ||
                0)).toFixed(), 4) }} {{ row?.outTokenSymbol }}
            </template>
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="t('status')" align="right">
        <template #header>
          <span>{{ t('status') }}</span>
          <el-dropdown trigger="click" @command="handleStatusCommand">
            <Icon name="custom:filter" class="color-[--d-666-l-999] cursor-pointer text-10px mt-5px" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ t('all') }}</el-dropdown-item>
                <el-dropdown-item command="confirmed">{{ t('completed') }}</el-dropdown-item>
                <el-dropdown-item command="cancelled">{{ t('cancelled1') }}</el-dropdown-item>
                <el-dropdown-item command="error">{{ t('failed') }}</el-dropdown-item>
                <el-dropdown-item command="auto_cancelled">{{ t('autoCancelled') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="{ row }">
          <div class="text-[var(--d-999-l-959A9F)] text-right truncate">
            <span v-if="row.status === 'confirmed'">{{ t('completed')
            }}</span>
            <span v-else-if="row.status === 'error'" style="color: var(--color-red-500);word-break: break-all;">{{
              t('failed') }}<template v-if="row?.errorLog">({{ formatBotError(row?.errorLog) }})</template></span>
            <span v-else-if="row.status === 'cancelled'">{{ t('cancelled1')
            }}</span>
            <span v-else-if="row.status === 'auto_cancelled'">{{
              t('autoCancelled')
            }}</span>
            <span v-else style="color: var(--custom-text-1-color);">{{ t('pending') }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="t('CreateTime')" align="right">
        <template #default="{ row }">
          <span class="text-[var(--d-999-l-959A9F)] text-right">{{ formatDate(row.createTime, 'YYYY/MM/DD HH:mm')
            }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="t('operate')" align="right">
        <template #default="{ row }">
          <template v-if="row.status == 'confirmed' && row.swapType === 2 && row.chain === 'solana'">
            <share :statistics="row" :address="props.userAddress" :chain="row.chain" />
          </template>
          <Icon name="custom:browser" class="text-16px  ml-8px clickable color-[--d-999-l-666]"
            @click.stop.prevent="jumpExplorerUrl(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
// import { useStorage } from '@vueuse/core'
import BigNumber from 'bignumber.js'
import { formatDate, getSymbolDefaultIcon, getChainDefaultIcon, formatExplorerUrl } from '~/utils'
import { formatNumber } from '~/utils/formatNumber'
import { bot_getUserTxHistory1 } from '@/api/token'
import share from './share.vue'

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
const botStore = useBotStore()
const route = useRoute()
const { mode } = storeToRefs(useGlobalStore())
const { t } = useGlobalStore()
const configStore = useConfigStore()
const filterConditions = ref({
  isLimit: undefined as number | undefined,
  isBuy: undefined as number | undefined,
  statusType: ''
})

const txHistory = ref([])
const loading = ref(false)
// const isUnit = ref(true)

watch([() => props.chain, () => props.currentToken, () => tokenStore.placeOrderSuccess], () => {
  getTxHistory()
})

function handleTypeCommand(command: string) {
  if (command === 'all') {
    filterConditions.value.isBuy = undefined
    filterConditions.value.isLimit = undefined
  } else if (command === 'LimitSell') {
    // Explicit Limit Sell
    filterConditions.value.isBuy = 0
    filterConditions.value.isLimit = 1
  } else if (command === 'LimitBuy') {
    // Explicit Limit Buy
    filterConditions.value.isBuy = 1
    filterConditions.value.isLimit = 1
  } else if (command === 'MarketSell') {
    // Explicit Market Sell
    filterConditions.value.isBuy = 0
    filterConditions.value.isLimit = 0
  } else if (command === 'MarketBuy') {
    // Explicit Market Buy
    filterConditions.value.isBuy = 1
    filterConditions.value.isLimit = 0
  }
  getTxHistory()
}

function handleStatusCommand(command: string) {
  if (command === 'all') {
    filterConditions.value.statusType = ''
  } else {
    filterConditions.value.statusType = command
  }
  getTxHistory()
}

function jumpExplorerUrl(row: any) {
  if (!row.txHash) {
    return
  }
  window.open(formatExplorerUrl(row.chain, row.txHash, 'tx'))
}

function tableRowClick(row: any) {
  if (!row.txHash) return
  window.open(formatExplorerUrl(row.chain, row.txHash, 'tx'))
}

const getTxHistory = async () => {
  loading.value = true
  try {
    const res = await bot_getUserTxHistory1({
      page: 0,
      pageSize: 1000,
      chain: props.chain,
      walletAddress: props.userAddress,
      token: props.currentToken ? String(route.params.id).split('-')[0] : '',
      timeSort: true,
      tradeVolumeSort: false,
      isSuccess: false,
      status: filterConditions.value.statusType,
      isLimit: filterConditions.value.isLimit,
      isBuy: filterConditions.value.isBuy,
      tgUid: botStore?.userInfo?.tgUid,
      minTradeVolume: 0,
      maxTradeVolume: 100000
    })
    console.log(res, 'res')

    txHistory.value = res || []
  } catch (error) {
    console.error('Error fetching transaction history:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTxHistory()
})
</script>

<style>
:root {
  --color-red-500: #F6465D;
}

.light {
  --custom-table-th-bg-color: #ECECEC;
  --a-text-1-color: #f5f5f5;
  --custom-br-1-color: #f5f5f5;
  --custom-table-th-bg-color: #ECECEC;
  --a-text-2-color: #666666;
  --a-table-hover-bg-color: #fafafa;
  --custom-font-1-color: #333333;
}

.dark {
  --custom-table-th-bg-color: #17191C;
  --a-text-1-color: #222;
  --custom-br-1-color: #33353D;
  --custom-table-th-bg-color: #17191C;
  --a-text-2-color: #999999;
  --a-table-hover-bg-color: #1E2024;
  --custom-font-1-color: #eaecef;
}
</style>
<style lang="scss" scoped>
:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu) {
  background-color: #0A0B0D;
  border: 1px solid var(--custom-br-1-color);
}

:deep(.el-table) {
  --el-table-tr-bg-color: #0A0B0D;
  --el-table-bg-color: #0A0B0D;
  --el-table-text-color: var(--a-text-1-color);
  --el-table-header-bg-color: var(--custom-table-th-bg-color);
  --el-fill-color-lighter: #0A0B0D;
  --el-table-header-text-color: var(--a-text-2-color);
  --el-table-border-color: var(--custom-br-1-color);
  --el-table-row-hover-bg-color: var(--a-table-hover-bg-color);
  background: #0A0B0D;
  --el-bg-color: #0A0B0D;
  --el-table-border: 0.5px solid var(--custom-br-1-color);
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
