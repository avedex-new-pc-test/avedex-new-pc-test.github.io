export interface IPRICEV2Response {
  event: string;
  prices: {
    chain: string;
    pair: string;
    is_main_pair: boolean;
    target_token: string;
    base_token: string;
    uprice: number;
    last_price: number;
    reserve0: string;
    reserve1: string;
    tvl: number;
    price_change: string;
    volume_24_u: number;
    direction: string;
    time: number;
    volume_u_24h: number;
    change: number;
    token: string;
  }[];
}
