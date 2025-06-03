
interface HolderInfo {
  holderStats: HolderStat[]
  aggregateStats: AggregateStats
}

export interface AggregateStats {
  balance: number
  balance_usd: number
  largestPosition: number
  largestPosition_usd: number
  buy: number
  sell: number
  soldAll: number
  all: number
  totalProfit: number
  totalProfitRatio: number
}
export interface HolderStat {
  holder: string
  chain: string,
  remark: string
  wallet_logo: WalletLogo
  is_wallet_address_fav: number
  new_tags: NewTag[]
  balance: number
  balance_ratio: number
  balance_usd: number
  main_coin_balance: number
  bought: number
  bought_usd: number
  total_bought: number
  total_sold: number
  avg_purchase_price: number
  sold: number
  sold_usd: number
  avg_sale_price: number
  realized_profit: number
  unrealized_profit: number
  total_profit: number
  realized_profit_ratio: number
  unrealized_profit_ratio: number
  total_profit_ratio: number
  transfer_in: number
  transfer_out: number
  max_single_purchase_usd: number
  max_single_sold_usd: number
  max_txn_usd: number
  total_transfer_in: number
  total_transfer_out: number
  total_transfer_in_usd: number
  last_txn_time?: Date
  age?: Date
  token_first_transfer_in_from: string
  token_first_transfer_in_time: Date | null
  sol_first_transfer_in_from: string
  sol_first_transfer_in_time: Date | null
  max_balance: number
  blueWhaleStats: null
  main_coin_price: number
  main_coin_symbol: string
  token_first_transfer_in_from_remark: string
  sol_first_transfer_in_from_remark: string
}
interface NewTag {
  type: string
  en: string
  cn: string
  tw: string
  es: string
  pt: string
  tr: string
  ja: string
  icon: string,
  color: string
  extra_info: null
  nick_name: string
}
interface WalletLogo { }

export function _getHoldersList(params: {
  token_id: string
  tag_type?: string
  sort_by?: string | undefined
  order?: string | undefined
  recent?: number | undefined
  self_address?: string
}): Promise<Array<HolderInfo>> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/holders', {
    method: 'get',
    query: params,
  })
}


export interface Top100range {
  date: string
  dev_balance_ratio: number
  insider_balance_ratio: number
  kol_balance_ratio: number
  smartmoney_balance_ratio: number
  sniper_balance_ratio: number
  token: string
  top10_amount: number
  top20_amount: number
  top50_amount: number
  top100_amount: number
  total_amount: number
}
export function _getTop100range(tokenId: string): Promise<Top100range[]> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/stats/top100range', {
    method: 'get',
    query: {
      token_id: tokenId,
    },
  })
}


export interface Top100Balance {
  address: string
  amount_cur: number
  amount_diff_3days: number
  buy_amount_cur: number
  buy_amount_diff_3days: number
  buy_tx_count_cur: number
  buy_volume_cur: number
  buy_volume_diff_3days: number
  chain: string
  cost_cur: number
  cost_diff_3days: number
  is_wallet_address_fav: number
  newTags: []
  remark: string
  sell_amount_cur: number
  sell_amount_diff_3days: number
  sell_tx_count_cur: 4
  sell_volume_cur: number
  sell_volume_diff_3days: number
  trade_first_at: number
  trade_last_at: number
  wallet_logo: {}
  wallet_tag_extra: {}
  wallet_tag_v2: string
}
export function _getTop100balance(params: {
  token_id: string
  address?: string
}): Promise<Top100Balance[]> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/top100balance', {
    method: 'get',
    query: {
      token_id: params.token_id,
      size: 100,
      address: params.address,
    },
  })
}