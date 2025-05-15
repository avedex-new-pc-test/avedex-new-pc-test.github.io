import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

import dayjs from '@/utils/day/index'

type LocaleType = ReturnType<typeof useI18n>['locale']['value']

export const useLocaleStore = defineStore('locale', () => {
  const locale = useLocalStorage('language', 'en') as RemovableRef<LocaleType>

  async function setLanguage(lang: LocaleType) {
    const { loadLocaleMessages, getLocaleMessage } = useNuxtApp().$i18n
    const messages = getLocaleMessage(lang)
    const isLocaleLoaded = messages && Object.keys(messages).length > 0
    if (!isLocaleLoaded) {
      await loadLocaleMessages(lang)
    }
    locale.value = lang
  }

  watch(locale, (val) => {
    dayjs.locale(val === 'zh-cn' ? 'zh' : (val === 'zh-tw' ? 'zh-tw' : 'en'))
  })
  return { locale, setLanguage }
})
