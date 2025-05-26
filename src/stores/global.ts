import { defineStore } from 'pinia'
export const useGlobalStore = defineStore('global', () => {
  const { t } = useI18n()
  const localeStore = useLocaleStore()
  const themeStore = useThemeStore()
  const configStore = useConfigStore()
  return {
    t,
    lang: computed(() => localeStore.locale),
    token_logo_url: computed(() => configStore.token_logo_url),
    mode: computed(() => themeStore.isDark ? 'dark' : 'light'),
    isDark: computed(() => themeStore.isDark)
  }
})
