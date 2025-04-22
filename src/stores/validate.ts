import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useValidateStore = defineStore('validate', () => {
  const validateDialogVisible = ref(false)
  const aToken = useLocalStorage('ave_token', '')
  const routeKey = ref(0)

  function switchValidateDialogVisible(visible: boolean) {
    validateDialogVisible.value = visible
  }

  function setAToken(val: string) {
    aToken.value = val
  }
  return {
    validateDialogVisible,
    aToken,
    routeKey,
    switchValidateDialogVisible,
    setAToken
  }
})
