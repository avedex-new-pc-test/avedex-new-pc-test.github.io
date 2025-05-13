<template>
  <van-notice-bar
    v-if="(tokenStore?.tokenInfo?.token?.risk_level || 0) < 0"
    left-icon="volume-o"
    color="#f00"
    :background="!themeStore.isDark ? '#ffa94d0d' : '#36131C'"
    :text="$t('riskWarning') + ': ' + $t('riskWarningContent1')"
  />
</template>

<script setup lang='ts'>
const tokenStore = useTokenStore()
const themeStore = useThemeStore()
</script>

<style>

</style>
