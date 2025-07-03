export interface GetSignalV2ListResponse {
  first_signal_time: number;
  last_signal_time: number;
  max_price_change: string;
  history_count: number;
  token: string;
  chain: string;
  day_high_price: string;
  first_signal_price: string;
  first_signal_mc: string;
  id: number;
  symbol: string;
  logo: string;
  token_tag: string;
  token_create_time: number;
  top10_ratio: string;
  dev_ratio: string;
  insider_ratio: string;
  mc: string;
  mc_cur: string;
  holders_cur: number;
  signal_time: number;
  tag: string;
  amm: string;
  action_wallet_type: string;
  action_type: string;
  action_count: number;
  actions: IActionItem[];
  signal_type: string;
  issue_platform: string;
  headline: string;
  price_change_24h: string;
}

export interface IActionItem {
  id: number
  wallet_address: string
  wallet_alias: string
  action_type: string
  quote_token_amount: string
  quote_token_symbol: string
  quote_token_address: string
  quote_token_volume: string
  action_time: number
}

/**
 * 信号广场列表
 */
export function getSignalV2List(query: {
  pageNO: number
  pageSize: number
  token?: string
  chain: string,
  fold?: boolean
}): Promise<GetSignalV2ListResponse[]> {
  const {$api} = useNuxtApp()
  // 前面的是折叠的接口
  const url = query.fold ? '/v2api/signals/v2/public/list/v2' : '/v2api/signals/v2/public/list'
  return $api(url, {
    method: 'get',
    query
  })
}

export interface GetTimelineResponse {
  time: number;
  chain: string;
  volume: string;
  golds: any[];
}

/**
 * 获取信号广场时间线
 */
export function getTimeline(chain: string): Promise<GetTimelineResponse[]> {
  const {$api} = useNuxtApp()
  return $api('/v2api/signals/v2/timeline', {
    method: 'get',
    query: {
      chain
    }
  })
}
