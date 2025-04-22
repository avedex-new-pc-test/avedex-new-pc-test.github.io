import type { MyFetchContext } from './type'
import { isJSON } from '@/utils/index'

type FetchHeaders = Headers & {
  Authorization?: string
  'ave-udid'?: string
  signature?: string
  'X-Auth'?: string
  'Ave-Platform'?: string
  lang?: string
}

export function botOnRequest({ options, request }: MyFetchContext){
  const botStore = useBotStore()
  const lang = localStorage.language || 'en'
  const headers = options.headers as FetchHeaders
  const url = request as string
  headers.lang = (lang == 'zh-cn' || lang == 'zh-tw') ? 'cn' : 'en'
  if (url?.includes('refreshNewToken') && botStore.refreshToken) {
    headers.Authorization = `Bearer ${botStore.refreshToken}`
  } else if (!url?.includes('login') && botStore.accessToken) {
    headers.Authorization = `Bearer ${botStore.accessToken}`
  }
}

export function botOnResponse({ response }: MyFetchContext) {
  if (!response) {
    return
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

export function botOnResponseError({ response, request }: MyFetchContext) {
  if (!response) {
    return
  }
  const status = response.status
  if (status === 401) {
    const botStore = useBotStore()
    const url = request as string
    if (!botStore.refreshing) {
      const type: 'ref' | 'acc' = url?.includes('refreshNewToken') ? 'ref' : 'acc'
      botStore.botReqCount++
      if (botStore.botReqCount < 6) {
        botStore.refreshAccessToken(type)
      } else {
        botStore.logout()
      }
    }
  }
}

