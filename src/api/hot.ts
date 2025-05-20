import { MAIN_COIN } from '@/utils/constants.js'
import type { SearchWalletInfo, SearchInfo } from '@/api/types/search'
export function getHot(): Promise<
  Array<{
    amm: string
    burn_amount: number
    chain: string
    network: string
    current_price_usd: number
    front_show_index: number
    holders: number
    hot_rank: number
    is_adv: number
    is_hot: number
    is_showasadv: number
    launchpad: string
    lock_amount: number
    logo_url: string
    mcap: number
    opening_at: number
    other_amount: number
    pool_size: number
    price_change: number
    risk_score: number
    symbol: string
    token: string
    token_index: number
    total: number
    tx_amount_24h: number
    tx_count_24h: number
    tx_volume_u_24h: number
    risk_level: number
  }>
> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/tokens/hot', {
    method: 'get',
  })
}

export function _getSmartTop10(params: {
  chain: string
  self_address?: string
}): Promise<Array<SearchWalletInfo>> {
  const { $api } = useNuxtApp()
  return $api('/v2api/smart_wallet/v1/top10', {
    method: 'get',
    query: params,
  })
}
export function _tokenSearchV3(params: {
  query: string
  self_address?: string
}): Promise<SearchInfo> {
  let newQuery = params.query
  if (MAIN_COIN[newQuery]) {
    newQuery = MAIN_COIN[newQuery]
  }
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/tokens/queryv3', {
    method: 'get',
    query: {
      keyword: newQuery,
      self_address: params.self_address ? params.self_address : undefined
    },
  })
}
