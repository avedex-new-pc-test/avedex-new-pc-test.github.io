// src/middleware/router.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // console.log('to', from, to)
  // navigateTo(to.fullPath)
  if (to.fullPath?.includes('/login')) {
    const query = to.query
    if (query.redirectUrl) {
      const botStore = useBotStore()
      botStore.login(query as any)
      navigateTo((query.redirectUrl as string)?.replace(/^(.*?)(\/.*)$/, '$2'), { external: true })
    }
  }
  if (!to.fullPath?.includes('/token')) {
    useHead({ title: 'Ave.ai' })
  }
})
