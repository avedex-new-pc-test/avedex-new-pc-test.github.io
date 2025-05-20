import type { TokenInfo, TokenInfoExtra } from './types/token'

export function getTokenInfo(id: string): Promise<null | TokenInfo> {
  const {address, chain} = getAddressAndChainFromId(id)
  if (!address || !chain) {
    return Promise.resolve(null)
  }
  let id1 = id
  if (address === NATIVE_TOKEN) {
    const address1 = getChainInfo(chain)?.wmain_wrapper
    id1 = address1 + '-' + chain
  }
  const { $api } = useNuxtApp()
  return $api(`/v1api/v3/tokens/${id1}`)
}

export function getTokenInfoExtra(id: string): Promise<null | TokenInfoExtra> {
  const {address, chain} = getAddressAndChainFromId(id)
  if (!address || !chain) {
    return Promise.resolve(null)
  }
  let id1 = id
  if (address === NATIVE_TOKEN) {
    const address1 = getChainInfo(chain)?.wmain_wrapper
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
  const [pair, chain] = getAddressAndChainFromId(data.pair, 1)
  if (!pair || !chain) {
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

export interface GetHotTokensResponse {
  token: string;
  chain: string;
  symbol: string;
  holders: number;
  current_price_usd: number | string;
  price_change: number | string;
  is_adv: number;
  is_showasadv: number;
  token_index: number;
  front_show_index: number;
  logo_url: string;
  opening_at: number;
  hot_rank: number;
  tx_amount_24h: number;
  tx_count_24h: number;
  tx_volume_u_24h: number;
  risk_score: number;
  pool_size: number;
  total: number;
  lock_amount: number;
  burn_amount: number;
  other_amount: number;
  amm: string;
  mcap: number;
  is_hot: number;
  launchpad: string;
}

export function getHotTokens(): Promise<GetHotTokensResponse[]> {
  const {$api} = useNuxtApp()
  return $api('/v1api/v2/tokens/hot', {
    method: 'get',
  })
}

export function getPairTxs(pair: string, address: string) {
  const {$api} = useNuxtApp()
  return $api(`/v1api/v5/pairs/${pair}/txs`, {
    method: 'get',
    params: {
      address: address,
      pair,
    },
  })
}
