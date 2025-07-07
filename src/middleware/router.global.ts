// src/middleware/router.global.ts
const redirectToOldUrls = ['/address']
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
  const needRedirectToOld = redirectToOldUrls.find((url) => to.fullPath.includes(url))
  const isBtcOrSolana = ['bsc', 'solana'].includes(to.params.chain as string)
  if(needRedirectToOld && !isBtcOrSolana) {
    let query = ''
    const botStore = useBotStore()
    if (botStore.accessToken &&  botStore.refreshToken) {
      query = `?act=${botStore.accessToken}&ret=${botStore.refreshToken}`
    }
    navigateTo('https://ave.ai'+to.path + query,{
      open:{
        target:'_blank'
      }
    })
    return abortNavigation()
  }
  if (!to.fullPath?.includes('/token')) {
    useHead({ title: 'Ave.ai' })
  } else if (to.fullPath?.includes(NATIVE_TOKEN)) {
    const {chain} = getAddressAndChainFromId(to.params.id as string)
    const mainUrl = getChainInfo(chain)?.wmain_wrapper
    if (mainUrl) {
      return navigateTo(`/token/${mainUrl}-${chain}`, {replace: true})
    }
  }
})
