// plugins/api.ts
import { getApiDomainAndSave, getBestApiDomain } from './getApiDomain'
import { onRequest, onResponse, onResponseError } from './base'
import { botOnRequest, botOnResponse, botOnResponseError } from './bot'


function getApi() {
  getApiDomainAndSave()
  const baseURL = getBestApiDomain()
  const $api = $fetch.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest({ options, request }) {
      const baseURL = getBestApiDomain()
      if (baseURL && options.baseURL !== baseURL) {
        options.baseURL = baseURL
      }
      const url = request as string
      if (url?.includes('botapi')) {
        botOnRequest({ options, request })
      } else {
        onRequest({ options, request })
      }
    },
    onResponse({ response, request, options }) {
      // 全局响应处理
      const url = request as string
      if (url?.includes('botapi')) {
        botOnResponse({ options, request, response })
      } else {
        onResponse({ options, request, response })
      }
    },
    onResponseError({ response, options, request }) {
      // 全局错误处理
      const url = request as string
      if (url?.includes('botapi')) {
        botOnResponseError({ options, response, request })
      } else {
        onResponseError({ options, response, request })
      }
    },
  })
  return $api
}


export default defineNuxtPlugin(() => {
  const $api = getApi()
  return {
    provide: {
      api: $api, // 通过 nuxtApp.$api 使用
    },
  }
})
