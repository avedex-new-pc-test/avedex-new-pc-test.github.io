import { defineStore } from 'pinia'
export const useGlobalStore = defineStore('global', () => {
  const { isDark } = useThemeStore()
  const { t } = useI18n()
  const mode = computed(() => isDark ? 'dark' : 'light')
  const lang = useLocaleStore().locale
  return {
    t,
    lang,
    mode
  }
})
