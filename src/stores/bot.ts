import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { refreshAccessToken as _refAcc, login, bot_getWalletsAllChain } from '@/api/bot'
import { createCacheRequest } from '@/utils/cacheRequest'
import { tgLogin } from '@/utils/bot'

const _refreshAccessToken = createCacheRequest(_refAcc, 3000)

export const useBotStore = defineStore('bot', () => {
  const isSupportChains = ['eth', 'bsc', 'solana', 'base']
  const accessToken = useLocalStorage('bot_accessToken', '')
  const refreshToken = useLocalStorage('bot_refreshToken', '')
  const evmAddress = useLocalStorage('bot_evmAddress', '')
  const botReqCount = ref(0)
  const refreshing = ref(false)
  const walletList = shallowRef<Awaited<ReturnType<typeof bot_getWalletsAllChain>>>([])
  const userInfo = computed(() => {
    return walletList.value?.find?.(i => i.evmAddress === evmAddress.value)
  })


  function refreshAccessToken(type: 'acc' | 'ref') {
    if (!refreshToken.value) {
      return Promise.reject('no refreshToken')
    }
    return _refreshAccessToken(type).then(res => {
      if (res?.accessToken) {
        accessToken.value = res.accessToken
      }
      if (res?.refreshToken) {
        refreshToken.value = res.refreshToken
      }
    })
  }



  function getUserInfo(evmAddress1 = '') {
    if (accessToken.value) {
      bot_getWalletsAllChain({chain: isSupportChains?.join(',')}).then(res => {
        walletList.value = res || []
        if (evmAddress1) {
          const item = walletList.value?.find?.(i => i.evmAddress === evmAddress1)
          if (item) {
            evmAddress.value = evmAddress1
          } else {
            evmAddress.value = walletList.value?.[0]?.evmAddress || ''
          }
        } else {
          const isWallet = walletList.value?.find?.(i => evmAddress.value === i?.evmAddress && userInfo.value?.addresses?.length === i?.addresses?.length)
          if (!isWallet) {
            evmAddress.value = walletList.value?.[0]?.evmAddress || ''
          }
        }
        // 获取其他用户信息
      })
    }
  }

  function _login(data: Parameters<typeof login>[0]) {
    login(data).then(res => {
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken
      evmAddress.value = res.evmAddress
      getUserInfo()
    })
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    evmAddress.value = ''
  }

  return {
    accessToken,
    refreshToken,
    botReqCount,
    refreshing,
    evmAddress,
    userInfo,
    refreshAccessToken,
    logout,
    login: _login,
    tgLogin,
    getUserInfo
  }
})
