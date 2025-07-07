// import { createCacheRequest } from '#imports'

// export const getUserWalletTxInfo = createCacheRequest(async function(query: {
//   user_address: string
//   user_token: string
//   chain: string
// }) {
//   const { $api } = useNuxtApp()
//   return $api('/v2api/walletinfo/v1/usertx', {
//     method: 'get',
//     query
//   })
// }, 2000)

// 获取消息通知
export function getAnnounces() {
  const {$api} = useNuxtApp()
  return $api('/v1api/v2/announces', {
    method: 'get',
    query: {
      platform: 'pc'
    }
  })
}

// 获取最新消息
export function getLatest() {
  const {$api} = useNuxtApp()
  return $api('/v1api/v2/announces/latest', {
    method: 'get',
    params: {
      platform: 'pc'
    }
  })
}
