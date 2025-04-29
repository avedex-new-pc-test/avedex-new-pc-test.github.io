import type { MyFetchContext } from './type'
import { isJSON } from '@/utils/index'

export function botOnRequest({ options, request }: MyFetchContext){
  const botStore = useBotStore()
  const lang = localStorage.language || 'en'
  options.headers = new Headers(options.headers)
  const url = request as string
  const lang1 = (lang == 'zh-cn' || lang == 'zh-tw') ? 'cn' : 'en'
  options.headers.set('lang', lang1)
  if (url?.includes('refreshNewToken') && botStore.refreshToken) {
    options.headers.set('Authorization', `Bearer ${botStore.refreshToken}`)
  } else if (!url?.includes('login') && botStore.accessToken) {
    options.headers.set('Authorization', `Bearer ${botStore.accessToken}`)
  }
}

export function botOnResponse({ response, request, options }: MyFetchContext) {
  if (!response) {
    return
  }
  if (response.status >= 400) {
    return botOnResponseError({ response, request, options })
  }
  const data = response._data
  if (data?.status === 0) {
    const botStore = useBotStore()
    botStore.botReqCount = 0
    response._data = data?.data
  } else {
    let msg = data?.msg || 'error'
    if (isJSON(msg)) {
      msg = JSON.parse(msg)
    }
    throw createError(msg?.msg || msg || 'error')
  }
}

export async function botOnResponseError({ response, request }: MyFetchContext) {
  if (!response) {
    return
  }
  const status = response.status
  if (status === 401) {
    const botStore = useBotStore()
    const url = request as string
    const type: 'ref' | 'acc' = url?.includes('refreshNewToken') ? 'ref' : 'acc'
    return botStore.refreshAccessToken(type).then(async () => {
      return true
    }).catch(async err => {
      console.log(err)
      if (type === 'ref') {
        botStore.logout()
      }
      return false
    })
  } else {
    return false
  }
}

