<template>
  <NuxtPwaAssets />
  <el-config-provider :locale="elementLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
  <TokenDetails/>
</template>

<script setup lang='ts'>
  import TokenDetails from '~/pages/token/components/tokenDetails/index.vue'
  import { useRemarksStore } from '@/stores/remarks'
  import en from 'element-plus/es/locale/lang/en'
  import type {GetHotTokensResponse} from '~/api/token'
  import {ProvideType} from '~/utils/constants'
  const elementLocale = shallowRef(en)

  const elementLocaleMap: Map<string, typeof en> = new Map()
  const hotTokens = shallowRef<GetHotTokensResponse[]>([])
  provide(ProvideType.HOT_TOKENS, {
    value: hotTokens,
    setVal: (val: GetHotTokensResponse[]) => hotTokens.value = val
  })

  watch(() => useLocaleStore().locale, async (val) => {
    if (!val) return
    if (elementLocaleMap[val]) {
      elementLocale.value = elementLocaleMap[val]
      return
    }
    if (val === 'zh-cn') {
      elementLocale.value = (await import('element-plus/es/locale/lang/zh-cn')).default
    } else if (val === 'zh-tw') {
      elementLocale.value = (await import('element-plus/es/locale/lang/zh-tw')).default
    } else if (val === 'es') {
      elementLocale.value = (await import('element-plus/es/locale/lang/es')).default
    } else if (val === 'pt') {
      elementLocale.value = (await import('element-plus/es/locale/lang/pt')).default
    } else if (val === 'ru') {
      elementLocale.value = (await import('element-plus/es/locale/lang/ru')).default
    } else if (val === 'tr') {
      elementLocale.value = (await import('element-plus/es/locale/lang/tr')).default
    } else if (val === 'vi') {
      elementLocale.value = (await import('element-plus/es/locale/lang/vi')).default
    } else {
      elementLocale.value = en
    }
    elementLocaleMap[val] = elementLocale.value
  }, { immediate: true })


  // import { bot_getWalletsAllChain, bot_getWebConfig } from '@/api/bot'
  function init() {
    useConfigStore().getChainConfig()
    useConfigStore().getGlobalConfig()
    useBotStore().getUserInfo()
    useRemarksStore().initRemarks()
    useBotSwapStore().sendNativePriceWs()
  }

  onBeforeMount(() => {
    init()
  })

</script>

