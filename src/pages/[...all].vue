<script setup lang='ts'>
// 未匹配的路由跳转到首页
definePageMeta({
  middleware: defineNuxtRouteMiddleware(() => {
    return navigateTo('/', { replace: true, external: true })
  })
})
</script>
