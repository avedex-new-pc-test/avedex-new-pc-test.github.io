import { useDocumentVisibility } from '@vueuse/core'

export function useVisibilityChange(callback: () => void, refreshThreshold?: number) {
  const documentVisible = useDocumentVisibility()
  const lastHiddenTime = ref<number | null>(null)
  const REFRESH_THRESHOLD = refreshThreshold || (5 * 60 * 1000) // 10 分钟

  watch(documentVisible, (val) => {
    if (val === 'hidden') {
      lastHiddenTime.value = Date.now()
    }

    if (val === 'visible') {
      const now = Date.now()
      const duration = now - (lastHiddenTime.value || 0)
      if (duration > REFRESH_THRESHOLD) {
        callback()
      }
    }
  })
}
