import sha1 from 'crypto-js/sha1'
import isBase64 from 'is-base64'

import type { MyFetchContext } from './type'

type FetchHeaders = Headers & {
  Authorization?: string
  'ave-udid'?: string
  signature?: string
  'X-Auth'?: string
  'Ave-Platform'?: string
  lang?: string
}


let loading = false
let requestCount = 0

export function onRequest({ options, request }: MyFetchContext) {
   // 非 bot 基础请求
  const headers = options.headers as FetchHeaders
  // 请求头 语言
  let language: string = localStorage.getItem('language') || 'en'
  if (language?.includes('zh')) {
    language = 'cn'
  }
  headers.lang = language

  const url = request as string
  // 请求头 authorization
  if (url?.includes('/v1api/v1')) {
    const date = Date.now()
    const authorization = sha1(date + url.replace('/v1api', '') + '7vPoX2G.8LYVQfnt').toString()
    headers.Authorization = authorization + date
  }

  if (url?.includes('/v1api/') || url.startsWith('/v2api/')) {
    const analogDeviceId = localStorage.getItem('analogDeviceId')
    if (analogDeviceId) {
      headers['ave-udid'] = analogDeviceId
    }
    const currentAccount = localStorage.getItem('currentAccount')
    if (currentAccount) {
      const signature = useConfigStore().walletSignature?.[currentAccount] || ''
      if (signature) {
        headers.signature = signature
      }
    }
    const ave_token = localStorage.ave_token
    if (ave_token) {
      headers['X-Auth'] = ave_token
    }
    headers['Ave-Platform'] = 'web'
  }

  if (url?.includes('/v2api/fav_users/')) {
    const accessToken = useBotStore().accessToken
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }
}

export function onResponse({ response }: MyFetchContext) {
  // 全局响应处理
  if (!response) {
    return
  }
  const data = response._data
  if (data?.status === 0) {
    // return Promise.reject(data?.msg)
    throw createError(data?.msg)
  }
  if (data?.data_type === 1 && typeof(data?.data) === 'string' && data?.data) {
    response._data = JSON.parse(data?.data)
    return
  }
  if ((data?.data_type === 2  || data?.data_type === 3) && data?.encode_data && typeof(data?.encode_data) === 'string' && isBase64(data?.encode_data)) {
    response._data = JSON.parse(window.decodeURIComponent(window.atob(data?.encode_data).replace(/\+/g, ' ')))
    return
  }
  if (typeof(data) === 'string' && isBase64(data)) {
    response._data = JSON.parse(window.decodeURIComponent(window.atob(data).replace(/\+/g, ' ')))
    return
  }
  if (data?.status === 1 && data?.data) {
    response._data = data?.data
    return
  }
  response._data = data
}

export function onResponseError ({ response }: MyFetchContext) {
  const status = response?.status
  if (status === 403) {
    const validateStore = useValidateStore()
    if (!validateStore.validateDialogVisible) {
      validateStore.switchValidateDialogVisible(true)
    }
    if (!loading && requestCount < 3) {
      const w: Window & {
        vemachine?: {
          generateToken?: (arg: boolean) => Promise<string>
        }
      } = window
      w?.vemachine?.generateToken?.(true).then(res => {
        if (res) {
          // store.commit('setAToken', res)
          validateStore.routeKey++
        }
      }).catch(() => {
        if (!validateStore.validateDialogVisible) {
          validateStore.switchValidateDialogVisible(true)
        }
      }).finally(() => {
        loading = false
        requestCount++
      })
    }
  }
}

