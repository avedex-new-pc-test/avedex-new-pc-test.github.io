// plugins/i18n-global.client.ts
import { defineNuxtPlugin } from '#app'
import { setGlobalT } from '~/utils/i18nBridge'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as any
  setGlobalT(i18n.t)
})
