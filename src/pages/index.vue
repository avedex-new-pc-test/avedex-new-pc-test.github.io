<template>
  <div class="text-14px">
    <NuxtLink to="/token">token</NuxtLink>
    <el-button  v-tooltip="$t('connectWallet')" type="primary">111</el-button>
    <div class="h-400px w-600px text-[var(--d-333-l-ececec)]">
      <Demo/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import Demo from '~/components/ave-table/demo.vue'
</script>
<style>

</style>
