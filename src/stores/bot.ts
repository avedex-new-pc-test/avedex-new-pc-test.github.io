import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { refreshAccessToken as _refAcc } from '@/api/bot'
import { createCacheRequest } from '@/utils/cacheRequest'

const _refreshAccessToken = createCacheRequest(_refAcc, 3000)

export const useBotStore = defineStore('bot', () => {
  const accessToken = useLocalStorage('bot_accessToken', '')
  const refreshToken = useLocalStorage('bot_refreshToken', '')
  const botReqCount = ref(0)
  const refreshing = ref(false)

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

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
  }

  return {
    accessToken,
    refreshToken,
    botReqCount,
    refreshing,
    refreshAccessToken,
    logout
  }
})
