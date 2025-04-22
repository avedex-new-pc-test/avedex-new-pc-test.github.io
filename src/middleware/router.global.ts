// src/middleware/router.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('to', from, to)
  // navigateTo(to.fullPath)
})
