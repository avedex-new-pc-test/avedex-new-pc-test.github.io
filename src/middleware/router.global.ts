// src/middleware/router.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // console.log('to', from, to)
  if (to.fullPath?.includes('/login')) {
    const query = to.query
    if (query.redirectUrl) {
      const botStore = useBotStore()
      console.log('login ----', query)
      botStore.login(query as any)
      const redirectUrl = query.redirectUrl?.includes('/') ? (query.redirectUrl as string)?.replace(/^(.*?)(\/.*)$/, '$2') : '/'
      return navigateTo(redirectUrl, { replace: true })
    }
  }
  if (!to.fullPath?.includes('/token')) {
    useHead({ title: 'Ave.ai' })
  }
})
