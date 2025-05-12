import type { TokenInfo, TokenInfoExtra } from './types/token'

export function getTokenInfo(id: string): Promise<null | TokenInfo> {
  let { address, chain } = getAddressAndChainFromId(id)
  if (!address || !chain) {
    return Promise.resolve(null)
  }
  let id1 = id
  if (address === NATIVE_TOKEN) {
    let address1 = getChainInfo(chain)?.wmain_wrapper
    id1 = address1 + '-' + chain
  }
  const { $api } = useNuxtApp()
  return $api(`/v1api/v3/tokens/${id1}`)
}

export function getTokenInfoExtra(id: string): Promise<null | TokenInfoExtra> {
  let { address, chain } = getAddressAndChainFromId(id)
  if (!address || !chain) {
    return Promise.resolve(null)
  }
  let id1 = id
  if (address === NATIVE_TOKEN) {
    let address1 = getChainInfo(chain)?.wmain_wrapper
    id1 = address1 + '-' + chain
  }
  const { $api } = useNuxtApp()
  return $api(`/v1api/v2/tokens/${id1}/extraDetail`)
}


// 获取 K 线历史数据
export function getKlineHistoryData(data: {
  interval: string
  pair: string
}): Promise<{
  kline_data: Array<{
    close: number
    high: number
    low: number
    open: number
    tag: string
    time: number
    volume: number
  }>
  extra_data?: {
    amount_24: number
    exchangeTime_24: number
    highestPrice_24: number
    lowestPrice_24: number
    volume_24: number
  }
}> {
  if (!data?.pair) {
    return Promise.resolve({
      kline_data: [],
      extra_data: undefined
    })
  }
  const { $api } = useNuxtApp()
  return $api(`/v1api/v4/pairs/${data.pair}/kline`, {
    method: 'get',
    query: {
      interval: data.interval,
      category: 'u',
      count: 800
    }
  })
}

// 画像描点接口 用户交易
export function getUserKlineTxTags(data: {
  interval: string
  from: number
  to: number
  pair: string
  token_address: string
  user_address?: string
}): Promise<Array<{
  sell?: {
    amount: number
    txns: number
    volume: number
  }
  buy?: {
    amount: number
    txns: number
    volume: number
  }
  time: number
}>> {
  const { $api } = useNuxtApp()
  const user_address = data?.user_address
  if (!user_address || !data?.pair) {
    return Promise.resolve([])
  }
  return $api(`/v1api/v4/pairs/${data?.pair}/kline_tx_tags`, {
    method: 'get',
    query: {
      ...data,
      user_address,
    }
  }).catch(() => {
    return Promise.resolve([])
  })
}
