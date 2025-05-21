import { defineStore ,storeToRefs} from 'pinia'
export const useGlobalStore = defineStore('global', () => {
  const { isDark } = useThemeStore()
  const { t } = useI18n()
  const mode = computed(() => isDark ? 'dark' : 'light')
  const {locale} = storeToRefs(useLocaleStore())
  console.log('=>(global.ts:9) lang', locale)
  return {
    t,
    lang:locale,
    mode
  }
})
