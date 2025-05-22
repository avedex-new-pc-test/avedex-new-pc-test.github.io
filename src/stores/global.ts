import { defineStore } from 'pinia'
export const useGlobalStore = defineStore('global', () => {
  // const mode = computed(() => useThemeStore().isDark ? 'dark' : 'light')
  // const {locale} = storeToRefs(useLocaleStore())
  // console.log('=>(global.ts:9) lang', locale)
  return {
    t: useI18n().t,
    lang:useLocaleStore().locale,
    mode:computed(() => useThemeStore().isDark ? 'dark' : 'light'),
    isDark:useThemeStore().isDark
  }
})
