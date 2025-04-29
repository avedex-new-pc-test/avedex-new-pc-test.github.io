import SHA1 from 'crypto-js/sha1'
type AnyFn = (...args: any[]) => any

type HashMethod = 'sha1' | ((fn: AnyFn) => string)

type CacheOptions = {
  cacheTime?: number
  hashMethod?: HashMethod
  retryCount?: number
  retryDelay?: number
}

type CacheItem<T> = {
  timestamp: number
  response: T
}

const cache = new Map<string, CacheItem<any>>()
const pendingRequests = new Map<string, Promise<any>>()

function serialize(value: any): string {
  if (value === undefined || value === null || Number.isNaN(value)) return ''
  if (Array.isArray(value)) {
    return `[${value.map(serialize).sort().join(',')}]`
  }
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${key}:${serialize(value[key])}`).join(',')}}`
  }
  return String(value)
}

function defaultHashFn(fn: AnyFn): string {
  return SHA1(fn.toString()).toString()
}

function getHashFunction(method?: HashMethod): (fn: AnyFn) => string {
  if (!method || method === 'sha1') return defaultHashFn
  if (typeof method === 'function') return method
  throw new Error(`Invalid hash method: ${method}`)
}

function generateCacheKey(fnKey: string, params: any[]): string {
  return `${fnKey}::${serialize(params)}`
}

async function withRetry<T>(fn: () => Promise<T>, retryCount: number, retryDelay: number): Promise<T> {
  let attempt = 0
  while (attempt <= retryCount) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= retryCount) throw err
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      attempt++
    }
  }
  throw new Error('Unexpected retry failure')
}

export function createCacheRequest<Args extends any[], Result>(
  requestFn: (...args: Args) => Promise<Result>,
  opts?: number | CacheOptions
) {
  const {
    cacheTime = typeof opts === 'number' ? opts : opts?.cacheTime ?? 1000,
    hashMethod = typeof opts === 'object' ? opts.hashMethod : 'sha1',
    retryCount = typeof opts === 'object' ? opts.retryCount ?? 0 : 0,
    retryDelay = typeof opts === 'object' ? opts.retryDelay ?? 300 : 300,
  } = {}

  const hashFn = getHashFunction(hashMethod)
  const fnKey = hashFn(requestFn)

  async function cachedRequest(...params: Args): Promise<Result> {
    const now = Date.now()
    const cacheKey = generateCacheKey(fnKey, params)

    const cached = cache.get(cacheKey)
    if (cached && now - cached.timestamp < cacheTime) {
      return Promise.resolve(cached.response)
    }

    const pending = pendingRequests.get(cacheKey)
    if (pending) return pending

    const promise = withRetry(() => requestFn(...params), retryCount, retryDelay)
      .then(response => {
        cache.set(cacheKey, { timestamp: now, response })
        return response
      })
      .finally(() => {
        pendingRequests.delete(cacheKey)
      })

    pendingRequests.set(cacheKey, promise)
    return promise
  }

  cachedRequest.clear = () => {
    cache.clear()
    pendingRequests.clear()
  }

  cachedRequest.delete = (...params: Args) => {
    const key = generateCacheKey(fnKey, params)
    cache.delete(key)
    pendingRequests.delete(key)
  }

  return cachedRequest
}
