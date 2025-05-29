
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
