// stores/theme.ts
import { useSessionStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { TokenInfo, TokenInfoExtra } from '~/api/types/token'
import { BigNumber } from 'bignumber.js'

export const useTokenStore = defineStore('token', () => {
  const tokenInfo = ref<null | TokenInfo>(null)
  const tokenInfoExtra = shallowRef<null | TokenInfoExtra>(null)

  const token = computed(() => tokenInfo.value?.token)
  const pairs = computed(() => tokenInfo.value?.pairs)
  const pairAddress = useSessionStorage('token_pairAddress', '')
  const pair = computed(() => {
    if (pairAddress.value) {
      return pairs.value?.find(pair => pair.pair === pairAddress.value) || null
    }
    return pairs.value?.[0] || null
  })
  const tokenPrice = shallowRef(0)
  const price = computed(() => tokenPrice.value || token.value?.current_price_usd)

  const circulation = computed(() => {
    const circulation = new BigNumber(token.value?.total || 0)
      .minus(token.value?.lock_amount_dec || 0)
      .minus(token.value?.other_amount_dec || 0)
      .minus(token.value?.burn_amount_dec || 0)
    return circulation.lt(0) ? new BigNumber(0) : circulation
  })

  const marketCap = computed(() => {
    return new BigNumber(price.value || 0).times(circulation.value || 0).toFixed() || '0'
  })

  function switchPair(pair1: TokenInfo['pairs'][0]['pair']) {
    if (!pairs.value) return
    const isPair = pairs.value?.some(pair2 => pair2.pair === pair1)
    if (isPair) {
      pairAddress.value = pair1
    } else {
      pairAddress.value = pairs.value?.[0]?.pair
    }
  }

  function reset() {
    tokenInfo.value = null
    tokenInfoExtra.value = null
    tokenPrice.value = 0
    pairAddress.value = ''
  }
  return {
    tokenInfo,
    tokenInfoExtra,
    token,
    pairs,
    pairAddress,
    pair,
    price,
    tokenPrice,
    circulation,
    marketCap,
    reset,
    switchPair
  }
})

