<script setup lang='ts'>
definePageMeta({
  middleware: defineNuxtRouteMiddleware(() => {
    return navigateTo('/follow/parent/token', { replace: true })
  })
})
</script>