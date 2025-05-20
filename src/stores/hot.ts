import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { getHot as _getHot } from '@/api/hot'
import type { SearchHot } from '@/api/types/search'
export const useHotStore = defineStore('hot', () => {
  const hotList = useLocalStorage<SearchHot[]>('hotList', [])
  function getHot() {
    _getHot().then((res) => {
      hotList.value = Array.isArray(res) ? res?.map(i => {
        return {
          ...i,
          id: i.token + '-' + i.chain,
        }
      }) : []
    })
  }

  return {
    hotList,
    getHot,
  }
})
