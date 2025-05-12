// stores/theme.ts
import { defineStore } from 'pinia'
import type { TokenInfo, TokenInfoExtra } from '~/api/types/token'

export const useTokenStore = defineStore('token', () => {
  let tokenInfo = shallowRef<null | TokenInfo>(null)
  let tokenInfoExtra = shallowRef<null | TokenInfoExtra>(null)
  
  function reset() {
    tokenInfo.value = null
    tokenInfoExtra.value = null
  }
  return {
    tokenInfo,
    tokenInfoExtra,
    reset
  }
})
