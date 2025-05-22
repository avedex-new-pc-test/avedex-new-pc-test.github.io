import { defineStore } from 'pinia'
export const useGlobalStore = defineStore('global', () => {
  const { t } = useI18n()
  const localeStore = useLocaleStore()
  const themeStore = useThemeStore()
  return {
    t,
    lang: computed(() => localeStore.locale),
    mode: computed(() => themeStore.isDark ? 'dark' : 'light'),
    isDark: computed(() => themeStore.isDark)
  }
})
