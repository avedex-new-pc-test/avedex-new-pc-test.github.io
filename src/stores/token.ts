// stores/theme.ts
import { defineStore } from 'pinia'
import type { TokenInfo, TokenInfoExtra } from '~/api/types/token'

export const useTokenStore = defineStore('token', () => {
  const tokenInfo = shallowRef<null | TokenInfo>(null)
  const tokenInfoExtra = shallowRef<null | TokenInfoExtra>(null)

  const token = computed(() => tokenInfo.value?.token)
  const pairs = computed(() => tokenInfo.value?.pairs)

  function reset() {
    tokenInfo.value = null
    tokenInfoExtra.value = null
  }
  return {
    tokenInfo,
    tokenInfoExtra,
    token,
    pairs,
    reset
  }
})

