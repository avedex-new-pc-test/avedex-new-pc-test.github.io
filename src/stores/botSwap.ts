import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { bot_getGasTip } from '@/api/bot'
import { useBotStore } from './bot'

const defaultGasTips = [{'chain':'eth','mev':true,'high':'15000000000','average':'8000000000','low':'3000000000','gasLimit':200000},{'chain':'eth','mev':false,'high':'5000000000','average':'3000000000','low':'1000000000','gasLimit':200000},{'chain':'solana','mev':false,'high':'6000000','average':'4000000','low':'2000000','gasLimit':0},{'chain':'solana','mev':true,'high':'4200000','average':'4100000','low':'4000000','gasLimit':0},{'chain':'bsc','mev':true,'high':'3000000000','average':'1000000000','low':'500000000','gasLimit':200000},{'chain':'bsc','mev':false,'high':'3000000000','average':'1000000000','low':'500000000','gasLimit':200000},{'chain':'base','mev':true,'high':'3000000000','average':'1000000000','low':'500000000','gasLimit':200000},{'chain':'base','mev':false,'high':'3000000000','average':'1000000000','low':'500000000','gasLimit':200000}]


export const useBotSwapStore = defineStore('botSwap', () => {
  const gasTip = useLocalStorage('bot_gasTip_v1', defaultGasTips)

  const botStore = useBotStore()

  const wsStore = useWSStore()

  const priceLimit = shallowRef(0)


  const mainTokensPrice = shallowRef([
    {
      token: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
      chain: 'bsc',
      id: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c-bsc',
      current_price_usd: 0,
      price_change: 0
    },
    {
      token: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      chain: 'bsc',
      id: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c-bsc',
      current_price_usd: 0,
      price_change: 0
    },
    {
      token: '0x4200000000000000000000000000000000000006',
      chain: 'base',
      id: '0x4200000000000000000000000000000000000006-base',
      current_price_usd: 0,
      price_change: 0
    },
    {
      token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: 'eth',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2-eth',
      current_price_usd: 0,
      price_change: 0
    },
    {
      token: 'So11111111111111111111111111111111111111112',
      chain: 'solana',
      id: 'So11111111111111111111111111111111111111112-solana',
      current_price_usd: 0,
      price_change: 0
    }
  ])

  function _bot_getGasTip() {
    if (botStore.accessToken && botStore.userInfo?.tgUid) {
      return bot_getGasTip().then(async res => {
        const chains: string[] = botStore.isSupportChains?.filter(i => res?.every?.((j) => j?.chain !== i))
        gasTip.value = [...res, ...(chains?.map?.(i => {
          return {
            chain: i,
            mev: false,
            high: '3000000000',
            average: '1000000000',
            low: '500000000',
            gasLimit: 200000
          }
        }) || [])]
        return res
      })
    }
  }

  function sendNativePriceWs() {
    const data = {
      jsonrpc: '2.0',
      method: 'subscribe',
      params: ['pricev2', mainTokensPrice.value?.map(i => i.id)],
      id: 1,
    }
    wsStore.send(data)
  }

  function onmessageNativePrice(data: any) {
    const prices = data?.prices as { token: string, chain: string, uprice: number, price_change: number }[]
    mainTokensPrice.value = mainTokensPrice.value?.map?.(
      (i) => {
        const item = prices.find(
          (j) => j.token + '-' + j.chain === i?.id
        )
        if (item) {
          return {
            ...i,
            current_price_usd: item.uprice,
            price_change: item.price_change,
          }
        } else {
          return {
            ...i,
          }
        }
      }
    )
  }

 const mainTokensPriceIds = computed(() => mainTokensPrice.value?.map(i => i.id))

  return {
    gasTip,
    priceLimit,
    mainTokensPrice,
    mainTokensPriceIds,
    bot_getGasTip: _bot_getGasTip,
    sendNativePriceWs,
    onmessageNativePrice
  }
})
