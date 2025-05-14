<template>
  <div class="flex items-center justify-between text-12px mt-10px rounded-4px">
    <div>
      <div class="color-[var(--d-666-l-999)]">{{ tabActiveName }} VOL</div>
      <div class="color-[var(--d-F5F5F5-l-333)] mt-5px">
        {{ formatNumber(pair?.[`tx_${tabActive}_count` as TxCount] || 0, 1) }}<span
          class="color-[var(--d-666-l-999)]">/</span>${{ formatNumber(pair?.[`volume_u_${tabActive}` as VolumeU] || 0,
        2) }}</div>
    </div>
    <div class="text-center">
      <div class="color-[var(--d-666-l-999)]">Buy</div>
      <div class="mt-5px color-#12B886">
        {{ formatNumber(pair?.[`buys_tx_${tabActive}_count` as TxCount] || 0, 1) }}<span
          class="color-[var(--d-666-l-999)]">/</span>${{ formatNumber(pair?.[`buy_volume_u_${tabActive}` as VolumeU] ||
            0, 2) }}
      </div>
    </div>
    <div class="text-center">
      <div class="color-[var(--d-666-l-999)]">Sell</div>
      <div class="mt-5px color-#F6465D">
        {{ formatNumber(pair?.[`sells_tx_${tabActive}_count` as TxCount] || 0, 1) }}<span
          class="color-[var(--d-666-l-999)]">/</span>${{ formatNumber(pair?.[`sell_volume_u_${tabActive}` as VolumeU] ||
            0, 2) }}
      </div>
    </div>
  </div>
  <div class="flex mt-8px">
    <span class="bg-#12B886 h-4px rounded-2px" :style="{ width: bugProgress }" />
    <span class="flex-1 bg-#F6465D h-4px rounded-2px ml-2px" />
  </div>
</template>

<script setup lang='ts'>
import type { Pair } from '@/api/types/token'
import { formatNumber } from '@/utils/formatNumber'
const { tabActive, tabActiveName, pair } = defineProps<{
  tabActive: '5m' | '1h' | '4h' | '24h'
  tabActiveName: string
  pair: Pair | null
}>()

const bugProgress = computed(() => {
  if (!pair?.[`buy_volume_u_${tabActive}` as VolumeU]) return '0%'
  return  ((pair?.[`buy_volume_u_${tabActive}` as VolumeU]) || 0) / ((pair?.[`buy_volume_u_${tabActive}` as VolumeU] || 0) + (pair?.[`sell_volume_u_${tabActive}` as VolumeU] || 0)) * 100 + '%'
})

type VolumeU = 'volume_u_5m' | 'volume_u_1h' | 'volume_u_4h' | 'volume_u_24h' | 'buy_volume_u_5m' | 'buy_volume_u_1h' | 'buy_volume_u_4h' | 'buy_volume_u_24h' | 'sell_volume_u_5m' | 'sell_volume_u_1h' | 'sell_volume_u_4h' | 'sell_volume_u_24h'
type TxCount = 'tx_5m_count' | 'tx_1h_count' | 'tx_4h_count' | 'tx_24h_count' | 'buys_tx_5m_count' | 'buys_tx_1h_count' | 'buys_tx_4h_count' | 'buys_tx_24h_count' | 'sells_tx_5m_count' | 'sells_tx_1h_count' | 'sells_tx_4h_count' | 'sells_tx_24h_count'

</script>

