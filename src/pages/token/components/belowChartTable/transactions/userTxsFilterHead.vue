<script setup lang="ts">
import BigNumber from 'bignumber.js'
import {getPairTxs, type GetPairTxsResponse} from '~/api/token'

const props = defineProps({
  makerAddress: {
    type: String,
    default: ''
  },
  isLiquidity: Boolean,
  pairLiq: {
    type: Array,
    default: () => []
  },
  tagType: {
    type: String,
    default: ''
  },
  chain: {
    type: String,
    default: ''
  },
  isBuy: {
    type: Function,
    default: () => {
    }
  },
  getAmount: {
    type: Function,
    default: () => {
    }
  },
  getPrice: {
    type: Function,
    default: () => {
    }
  }
})

const tokenStore = useTokenStore()
const pairTxs = shallowRef<GetPairTxsResponse[]>([])
const balanceAmount = shallowRef('0')
const totalBuySell = computed(() => {
  let buyUSD = 0
  let sellUSD = 0
  let buyAmount = 0
  let sellAmount = 0
  pairTxs.value.forEach(tx => {
    if (props.isBuy(tx)) {
      buyUSD += props.getAmount(tx, true, true)
      buyAmount += props.getAmount(tx)
    } else {
      sellUSD += props.getAmount(tx, true, true)
      sellAmount += props.getAmount(tx)
    }
  })
  return {
    buyUSD, sellUSD, buyAmount, sellAmount
  }
})
const profit = computed(() => {
  const {buyUSD, sellUSD} = totalBuySell.value
  return buyUSD + sellUSD
})
const profitChange = computed(() => {
  const {buyUSD} = totalBuySell.value
  if (buyUSD > 0) {
    return profit.value / buyUSD
  }
  return 0
})
const avgSellPrice = computed(() => {
  return 0
})
const avgBuyPrice = computed(() => {
  return 0
})

watch(() => props.makerAddress, () => {
  _getPairTxs()
  _getTokenBalance()
}, {
  immediate: true
})

async function _getPairTxs() {
  try {
    const {tagType, chain} = props
    const getPairTxsParams = {
      pair: tokenStore.pairAddress + '-' + chain,
      tag_type: tagType,
      maker: props.makerAddress
    }
    const res = await getPairTxs(getPairTxsParams)
    pairTxs.value = res || []
  } catch (e) {
    console.log('=>(userTxsFilterHead.vue:40) e', e)
  }
}

// async function _getTokenBalance() {
//   try {
//     const tokenAddress = tokenStore.token?.token
//     if (tokenAddress) {
//       const res = await getTokenBalance({
//         chain: props.chain,
//         walletAddress: props.makerAddress,
//         tokens: [tokenAddress]
//       })
//       if (Array.isArray(res) && res.length > 0) {
//         balanceAmount.value = res[0]
//           ? new BigNumber(res[0].balance).div(new BigNumber(10).pow(res[0].decimals)).toString()
//           : '0'
//       }
//     }
//   } catch (e) {
//     console.log('=>(userTxsFilterHead.vue:83) e', e)
//
//   }
// }

function getColorClass(val: string) {
  if (Number(val) > 0) {
    return 'color-#12b886'
  } else if (Number(val) < 0) {
    return 'color-#ff646d'
  } else {
    return 'color-#848E9C'
  }
}
</script>

<template>
  <div class="px-12px lh-20px flex justify-between items-center mb-12px text-13px">
    <div>
      <span class="color-#959A9F">{{ $t('balance1') }}:</span>
      <span class="ml-4px">{{ balanceAmount }}</span>
      <span class="ml-4px">${{ balanceAmount }}</span>
    </div>
    <div>
      <span class="color-#959A9F">{{ $t('profit') }}:</span>
      <span :class="`ml-4px ${getColorClass(profit)}`">{{ formatNumber(profit, 2) }}</span>
      <span :class="`ml-4px ${getColorClass(profitChange)}`">{{ formatNumber(profitChange * 100, 1) }}%</span>
    </div>
    <div>
      <span class="color-#959A9F">{{ $t('totalBuy') }}:</span>
      <span class="color-#12B886 ml-4px">${{ formatNumber(totalBuySell.buyUSD || 0, 2) }}</span>
    </div>
    <div>
      <span class="color-#959A9F">{{ $t('totalSell') }}:</span>
      <span class="color-#F6465D ml-4px">${{ formatNumber(totalBuySell.sellUSD || 0, 2) }}</span>
    </div>
    <div>
      <span class="color-#959A9F">{{ $t('avgBuyPrice') }}:</span>
      <span class="color-#12B886 ml-4px">${{ formatNumber(avgBuyPrice || 0, 2) }}</span>
    </div>
    <div>
      <span class="color-#959A9F">{{ $t('avgSellPrice') }}:</span>
      <span class="color-#F6465D ml-4px">${{ formatNumber(avgSellPrice || 0, 2) }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
