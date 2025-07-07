export type WSTx = {
  amm: string
  amount_eth: string
  amount_usd: string
  block_number: number
  chain: string
  from_address: string
  from_amount: string
  from_price_eth: string
  from_price_usd: string
  from_reserve: string
  from_symbol: string
  id: string
  pair_address: string
  pair_liquidity_eth: string
  pair_liquidity_usd: string
  profile: string
  sender: string
  time: number
  to: string
  to_address: string
  to_amount: string
  to_price_eth: string
  to_price_usd: string
  to_reserve: string
  to_symbol: string
  transaction: string
  tx_seq: string
  wallet_address: string
  wallet_tag: null | string
  tx_type?: string
}

export interface KLineBar {
  time: number      // 毫秒时间戳，K线开始时间
  open: number
  high: number
  low: number
  close: number
  volume: number
}
