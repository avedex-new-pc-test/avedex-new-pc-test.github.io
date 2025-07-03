import { MAIN_COIN } from '@/utils/constants.js'
import type { SearchWalletInfo, SearchInfo } from '@/api/types/search'
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
  return $api('/v2api/token/v1/query', {
    method: 'get',
    query: {
      keyword: newQuery,
      self_address: params.self_address ? params.self_address : undefined
    },
  })
}
