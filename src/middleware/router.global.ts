// src/middleware/router.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // console.log('to', from, to)
  // navigateTo(to.fullPath)
  if (to.fullPath?.includes('/login')) {
    let query = to.query
    if (query.redirectUrl) {
      let botStore = useBotStore()
      botStore.login(query as any)
      navigateTo((query.redirectUrl as string)?.replace(/^(.*?)(\/.*)$/, '$2'),)
    }
  }
})
