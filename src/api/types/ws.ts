export interface IPriceV2Response {
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

export interface IAssetResponse {
  client_address: string;
  event: string;
  swap: {
    type: '0' | '1';
    chain: string;
    token: string;
    token_name: string;
    logo_url: string;
    time: number;
    rule_id: number;
    amount: string;
    amm: string;
    eth_price: string;
    price: string;
  };
}

