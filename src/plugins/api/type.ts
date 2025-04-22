import type { FetchOptions, FetchRequest, FetchResponse, FetchError } from 'ofetch'

// 通用 FetchContext 类型
export interface MyFetchContext<T = any, R = any> {
  request: FetchRequest
  options: FetchOptions
  response?: FetchResponse<R>
  error?: FetchError<T>
}
