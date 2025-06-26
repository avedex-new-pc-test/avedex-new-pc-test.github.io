export interface ITimeline {
    time: number;
    chain: string;
    volume: string;
    golds: Gold[];
}

export interface Gold {
    type: string;
    token: string;
    chain: string;
    symbol: string;
    logo: string;
    first_signal_time: number;
    price_change: string;
    mc: string;
}

/**
 * 获取信号广场时间线
 */
export function getTimeline(chain: string): Promise<ITimeline[]> {
    const {$api} = useNuxtApp()
    return $api('/v2api/signals/v2/timeline', {
        method: 'get',
        query: {chain}
    })
}

export interface ITopSignal {
  first_signal_time: number;
  last_signal_time: number;
  max_price_change: string;
  history_count: number;
  token: string;
  chain: string;
  day_high_price: string;
  first_signal_price: string;
  first_signal_mc: string;
}

/**
 * top 榜单
 */
export function getTopSignal(): Promise<ITopSignal[]> {
  const {$api} = useNuxtApp()
  return $api('https://0ftrfsdb.xyz/v2api/signals/v2/top_signal', {
    method: 'get'
  })
}
