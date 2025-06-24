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
