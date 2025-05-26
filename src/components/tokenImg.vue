<script setup lang="ts">
const {row} = defineProps({
  row: {
    type: Object as PropType<{
      chain: string;
      logo_url: string
    }>,
    default: () => ({
      chain: '',
      logo_url: ''
    })
  },
  tokenClass: {
    type: String,
    default: 'w-24px h-24px'
  },
  chainClass: {
    type: String,
    default: 'w-12px h-12px'
  }
})
const {token_logo_url} = useConfigStore()
const shouldAddPrefix = computed(() => {
  if (row.logo_url) {
    return !row.logo_url.startsWith('http')
  }
  return false
})
</script>

<template>
  <div class="relative">
    <el-image
      :class="`mr-3px rounded-full  block ${tokenClass}`"
      :style="{
         display:'block'
       }"
      :src="shouldAddPrefix
      ?`${token_logo_url}${row.logo_url}`
      : row.logo_url"
    >
      <template #error>
        <img class="w-full block" src="@/assets/images/icon-default.png" alt="">
      </template>
    </el-image>
    <img
      v-if="row.chain"
      :class="`rounded-full absolute right-0 bottom-0 block ${chainClass}`"
      :src="`${token_logo_url}chain/${row.chain}.png`"
      alt=""
    >
  </div>
</template>

<style scoped>

</style>
