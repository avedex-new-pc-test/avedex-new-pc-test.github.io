export const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const MAIN_COIN: {
  [key: string]: string
} = {
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-eth':
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2-eth',
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-bsc':
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c-bsc',
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-polygon':
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-polygon',
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-heco':
    '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f-heco',
}

export const upColor = ['#12B886']
export const downColor = ['#F6465D']
// WebSocket 事件类型常量
export const WSEventType = {
  KLINE: 'kline',
  SWITCH_MAIN_PAIR: 'switch_main_pair',
  TX: 'tx',
  LIQ: 'liq',
  PRICE: 'price',
  PRICE_NEW: 'price-new',
  PRICE_GAINER: 'price-gainer',
  PRICE_EXTRA: 'price_extra',
  PUMPSTATE: 'pumpstate',
  PRICEV2: 'pricev2',
  TGBOT: 'tgbot',
  ASSET: 'asset',
  MONITOR: 'monitor',
  GOLD_SIGNAL: 'gold_signal',
  SIGNALSV2_PUBLIC_MONITOR: 'signalsv2_public_monitor',
  PUBLIC_PORTRAIT: 'public_portrait',
}
