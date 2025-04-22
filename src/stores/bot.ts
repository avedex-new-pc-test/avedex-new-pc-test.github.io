import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useBotStore = defineStore('bot', () => {
  const accessToken = useLocalStorage('bot_accessToken', '')
  const refreshToken = useLocalStorage('bot_refreshToken', '')
  const botReqCount = ref(0)
  const refreshing = ref(false)

  function refreshAccessToken(type: 'acc' | 'ref') {
    console.log('refreshAccessToken', type)
  }

  function logout() {

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
