// plugins/theme-init.client.ts
import { defineNuxtPlugin } from '#app'
import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  const store = useThemeStore()
  store.setTheme(store.theme) // 强制同步 DOM class
})
