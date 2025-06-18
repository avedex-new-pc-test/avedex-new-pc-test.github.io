<template>
   <div class="w-follow bg-[--d-000-l-F6F6F6] pt-4px w-100%" style="height: calc(100vh - 92px);">
    <div class="flex flex-col bg-[--d-111-l-FFF] h-100%">
       <NuxtLink to="/follow/parent/token">token</NuxtLink>
       <NuxtLink to="/follow/parent/addr">address</NuxtLink>
       <NuxtLink to="/follow/parent/remark">remark</NuxtLink>
       <NuxtPage/>
    </div>
   </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
   key: (route) => {
    return (route.name as string)
  },
transition: {
    name: 'follow-parent',
  },
  keepalive: true,
})
</script>
