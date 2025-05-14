<script setup lang="ts">
import {getHotTokens, type GetHotTokensResponse} from '~/api/token'

onMounted(() => {
  _getHotTokens()
})

const listData = shallowRef<GetHotTokensResponse[]>([])

async function _getHotTokens() {
  try {
    const res = await getHotTokens()
    listData.value = res || []
  } catch (e) {
    console.log('=>(trending.vue:15) e', e)

  }
}
</script>

<template>

</template>

<style scoped>

</style>
