// stores/theme.ts
import { useSessionStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { TokenInfo, TokenInfoExtra } from '~/api/types/token'
import { BigNumber } from 'bignumber.js'
import type { GetTotalHoldersResponse} from '~/api/stats'
import {getTotalHolders} from '~/api/stats'

type Token = {
  chain?: string
  balance?: string
  symbol?: string
  decimals?: number
  address?: string
  price?: number
  logo_url?: string
}

export const useTokenStore = defineStore('token', () => {
  const route = useRoute()
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
  const tokenPriceChange = shallowRef(0)
  const totalHolders = shallowRef<GetTotalHoldersResponse[]>([])
  const price = computed(() => tokenPrice.value || token.value?.current_price_usd)
  const priceChange = computed(() => tokenPriceChange.value || pair.value?.price_change || token.value?.price_change)

  const swap = reactive<{
    native: Token
    token: Token
  }>({
    native: {},
    token: {}
  })

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
    tokenPriceChange.value = 0
    pairAddress.value = ''
  }

  function _getTotalHolders() {
    if (!route.params.id) return
    getTotalHolders(route.params.id as string).then(res => {
      totalHolders.value = Array.isArray(res) ? res : []
      triggerRef(totalHolders)
    })
  }
  return {
    tokenInfo,
    tokenInfoExtra,
    token,
    pairs,
    pairAddress,
    pair,
    price,
    priceChange,
    tokenPrice,
    circulation,
    marketCap,
    reset,
    switchPair,
    _getTotalHolders,
    totalHolders,
    swap
  }
})

