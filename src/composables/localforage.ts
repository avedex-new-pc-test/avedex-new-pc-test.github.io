import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'

export function useLocalforage(key: string, initialValue: any) {
  const value = ref(initialValue)

  ;(async () => {
    try {
      const storedValue = await localforage.getItem(key)
      value.value = storedValue !== null ? storedValue : initialValue
    } catch (error) {
      console.error('Error fetching data from localForage:', error)
    }
  })()

  watch(value, async (newValue) => {
    try {
      if (newValue === undefined) {
        await localforage.removeItem(key)
      } else {
        await localforage.setItem(key, cloneDeep(newValue)) // 使用 lodash 深拷贝
      }
    } catch (error) {
      console.error('Error updating data in localForage:', error)
    }
  }, { deep: true })

  return value
}
