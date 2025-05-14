import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

import dayjs from '@/utils/day/index'

type LocaleType = ReturnType<typeof useI18n>['locale']['value']

export const useLocaleStore = defineStore('locale', () => {
  const locale = useLocalStorage('language', 'en') as  RemovableRef<LocaleType>

  function setLanguage(lang: LocaleType) {
    console.log('-----111-------',lang)
    locale.value = lang
  }
  watch(locale, (val) => {
    dayjs.locale(val === 'zh-cn' ? 'zh' : (val === 'zh-tw' ? 'zh-tw' : 'en'))
  })
  return { locale, setLanguage }
})
