// plugins/i18n-sync.client.ts
import { useLocaleStore } from '~/stores/locale'

export default defineNuxtPlugin((nuxtApp) => {
  const localeStore = useLocaleStore()
  const i18n = nuxtApp.$i18n as any

  // 初始化同步语言
  i18n.locale.value = localeStore.locale

  // 监听 store 改变时更新 i18n
  watch(localeStore.$state, (newState) => {
    i18n.locale.value = newState.locale
  })

  // 监听 i18n 改变时更新 store
  watch(i18n.locale, (newLocale) => {
    if (localeStore.locale !== newLocale) {
      localeStore.locale = newLocale
    }
  })
})
