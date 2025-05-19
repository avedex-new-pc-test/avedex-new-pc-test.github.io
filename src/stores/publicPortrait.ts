// stores/publicPortrait.ts
import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'

interface PublicPortrait {
  wallet_address: string
  chain: string
  [key: string]: any
}

export const usePublicPortraitStore = defineStore('publicPortrait', () => {
  const publicPortrait = shallowRef<PublicPortrait[]>([])

  const publicPortraitObj = computed<Record<string, PublicPortrait>>(() => {
    const obj: Record<string, PublicPortrait> = {}
    publicPortrait.value.forEach((i) => {
      obj[`${i.wallet_address}-${i.chain}`] = i
    })
    return obj
  })

  function updatePublicPortrait(publicPortraitArr: PublicPortrait[]) {
    const arr = [...publicPortrait.value]
    publicPortraitArr.forEach((i) => {
      const existingIndex = arr.findIndex(j => j.wallet_address === i.wallet_address && j.chain === i.chain)
      if (existingIndex !== -1) {
        arr.splice(existingIndex, 1, i)
      } else {
        arr.push(i)
      }
    })
    publicPortrait.value = arr.slice(0, 100)
  }

  function getPublicPortrait(wallet_address: string, chain: string): PublicPortrait | undefined {
    return publicPortraitObj.value[`${wallet_address}-${chain}`]
  }

  function reset() {
    publicPortrait.value = []
  }

  return {
    publicPortrait,
    updatePublicPortrait,
    getPublicPortrait,
    reset
  }
})
