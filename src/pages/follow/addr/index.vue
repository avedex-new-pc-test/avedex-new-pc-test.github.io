<template>
  <div class="w-address">
    <ul>
      <li>address</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { getFavoriteList2 ,getAttentionPageList,getUserFavoriteGroups2} from '~/api/attention'
const {mode,lang,isDark} = storeToRefs(useGlobalStore())
const { t } = useI18n()
onMounted(async () => {
  const res = await getUserFavoriteGroups2()
  console.log('addr',res)
})
</script>

<style scoped lang="scss"></style>
