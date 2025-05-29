<template>
  <div class="text-14px text-center" style="height:calc(100vh - 100px);">
    <!-- <div class="h-400px w-600px text-[var(--d-333-l-ececec)]">
      <Demo/>
    </div> -->
    <NuxtLink v-for="(item, $index) in list" :key="$index" class="block mb-10px" :to="item.src">{{ item.name }}</NuxtLink>
  </div>
</template>

<script setup lang='ts'>
// import Demo from "~/components/ave-table/demo.vue";
const list = shallowRef([
  { name: 'PASTERNAK', src: '/token/Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk-solana' },
  { name: 'BUDDY', src: '/token/65svCEvM4HdBHXKDxfhjm3yw1A6mKXkdS6HXWXDQTSNA-solana' }
])
</script>
<style scoped lang="scss">
</style>
