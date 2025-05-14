import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

import dayjs from '@/utils/day/index'

type LocaleType = ReturnType<typeof useI18n>['locale']['value']

export const useLocaleStore = defineStore('locale', () => {
  const locale = useLocalStorage('language', 'en') as RemovableRef<LocaleType>
  const { loadLocaleMessages, getLocaleMessage } = useI18n()
  function isLocaleLoaded(locale: string): boolean {
    const messages = getLocaleMessage(locale)
    return messages && Object.keys(messages).length > 0
  }

  async function setLanguage(lang: LocaleType) {
    if (!isLocaleLoaded(lang)) {
      await loadLocaleMessages(lang)
    }
    locale.value = lang
  }
  
  watch(locale, (val) => {
    dayjs.locale(val === 'zh-cn' ? 'zh' : (val === 'zh-tw' ? 'zh-tw' : 'en'))
  })
  return { locale, setLanguage }
})
