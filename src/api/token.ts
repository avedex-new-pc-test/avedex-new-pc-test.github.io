import type { TokenInfo, TokenInfoExtra } from './types/token'
import { getAddressAndChainFromId, getChainInfo } from '@/utils'
import { NATIVE_TOKEN } from '@/utils/constants'

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

interface NewTag {
  type: string;
  en: string;
  cn: string;
  tw: string;
  es: string;
  pt: string;
  tr: string;
  ja: string;
  icon: string;
  color: string;
  extra_info: null;
  nick_name: string;
}
export interface GetPairTxsResponse {
  time: number;
  id: string;
  chain: string;
  transaction: string;
  amm: any;
  amount_eth: number;
  amount_usd: number;
  from_address: string;
  from_price_eth: number;
  from_price_usd: number;
  from_symbol: string;
  from_amount: number;
  to_address: string;
  to_price_eth: number;
  to_price_usd: number;
  to_symbol: string;
  to_amount: number;
  wallet_address: string;
  wallet_tag_extra: any;
  newTags: NewTag[];
  wallet_logo: any;
  wallet_tag_v2?: string;
  profile: string;
}

// 交易历史
export function getPairTxs(query: {
  pair: string,
  tag_type?: string,
  maker?: string,
  time_min?: string,
  time_max?: string
}): Promise<GetPairTxsResponse[]> {
  const {$api} = useNuxtApp()
  return $api(`/v1api/v5/pairs/${query.pair}/txs`, {
    method: 'get',
    query
  })
}

export interface GetPairLiqResponse {
  time: number;
  chain: string;
  transaction: string;
  amm: string;
  sender: string;
  pair_address: string;
  type: string;
  amount_eth: number;
  amount_usd: number;
  pair_liquidity_eth: number;
  pair_liquidity_usd: number;
  token0_address: string;
  token0_price_eth: number;
  token0_price_usd: number;
  token0_symbol: string;
  amount0: number;
  reserve0: number;
  token1_address: string;
  token1_price_eth: number;
  token1_price_usd: number;
  token1_symbol: string;
  amount1: number;
  reserve1: number;
  wallet_address: string;
  is_wallet_address_fav: number;
  remark: string;
  wallet_logo: any;
  newTags: NewTag[];
}

export interface Profile {
  token0TotalHolding: number;
  token1TotalHolding: number;
  token0Address: string;
  token1Address: string;
  solTotalHolding: number;
  token0HasNewAccount: boolean;
  token0HasClosedAccount: boolean;
  token0HasClearedAccount: boolean;
  token1HasNewAccount: boolean;
  token1HasClosedAccount: boolean;
  token1HasClearedAccount: boolean;
}


// 交易历史流动性
export async function getPairLiq(pair: string, address?: string): Promise<GetPairLiqResponse[]> {
  if (!pair || pair.length < 15) {
    return []
  }
  const {$api} = useNuxtApp()
  return $api(`/v1api/v4/pairs/${pair}/liq`, {
    method: 'get',
    params: {
      address
    },
  })
}

export interface GetTxsUserBriefResponse {
  remark: string;
  is_wallet_address_fav: number;
  chain: string;
  symbol: string;
  newTags: any[];
  balance_amount: string;
  balance_usd: string;
  history_max_balance_amount: string;
  history_max_balance_usd: string;
  history_min_balance_amount: string;
  history_min_balance_usd: string;
  total_transfer_in_usd: string;
  total_transfer_out_usd: string;
  total_transfer_in: string;
  total_transfer_out: string;
  total_transfer_in_amount: string;
  total_transfer_out_amount: string;
  total_sold_usd: string;
  total_purchase_usd: string;
  total_sold: string;
  total_purchase: string;
  total_sold_amount: string;
  total_purchase_amount: string;
  unrealized_profit: string;
  realized_profit: string;
  total_profit: string;
  total_profit_ratio: string;
  profit: string;
  profit_ratio: string;
  win_ratio: string;
  wallet_age: string;
  token_txns: string;
  top3_blue_chip: Top3BlueChip[];
}

interface Top3BlueChip {
  token: string;
  chain: string;
  symbol: string;
  logoUrl: string;
  balance_amount: number;
  balance_usd: number;
  current_price_usd: number;
}


// 获取交易Hover地址展示
export function getTxsUserBrief(query: {
  user_address: string;
  chain: string;
  token: string;
}): Promise<GetTxsUserBriefResponse> {
  const {$api} = useNuxtApp()
  return $api('/v2api/token/v1/user/brief', {
    method: 'get',
    query,
  })
}

export function getUserTxs(token_id: string, address: string) {
  const {$api} = useNuxtApp()
  return $api(`/v1api/v2/pairs/userMergedTxs`, {
    method: 'get',
    params: {
      token_id: token_id,
      user_address: address,
    }
  })
}

export function getTokensPrice(tokenIds: string[]) {
  const ids = tokenIds.map(i => {
    const [token, chain] = getAddressAndChainFromId(i, 1)
    if (token && chain && token === NATIVE_TOKEN) {
      const chainInfo = getChainInfo(chain)
      return chainInfo.wmain_wrapper + '-' + chain
    }
    return i
  })
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/tokens/price4h5',{
    method: 'post',
    body: {
      token_ids: ids
    }
  }).then(async res => {
    return ids.map(i => res[i])
  })
}
