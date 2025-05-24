import { createCacheRequest } from '#imports'

export const getUserWalletTxInfo = createCacheRequest(async function(query: {
  user_address: string
  user_token: string
  chain: string
}) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v1/usertx', {
    method: 'get',
    query
  })
}, 2000)
