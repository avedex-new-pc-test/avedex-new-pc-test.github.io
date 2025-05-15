import type { WSTx } from '@/components/kLine/types.ts'
import BigNumber from 'bignumber.js'
import { formatNumber } from './formatNumber'
export function updatePriceFromTx(tx: WSTx) {
  const tokenStore = useTokenStore()
  const price = Number(tx.from_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.() ? tx.from_price_usd : tx.to_price_usd) || 0
  if (tx.pair_address === tokenStore.pairAddress) {
    if (price) {
      tokenStore.tokenPrice = price
      if ((useRoute().fullPath as string)?.includes?.('/token')) {
        useHead({ title: '$' + formatNumber(price, 3) + ' ' + tokenStore.token?.symbol + ' | Ave' })
      }
    }
  }
  const isBuy = tx.to_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.()
  tokenStore?.pairs?.forEach(pair => {
    if (pair.pair === tx.pair_address) {
      pair.reserve0 = Number(isBuy ? tx.to_reserve : tx.from_reserve)
      pair.reserve1 = Number(isBuy ? tx.from_reserve : tx.to_reserve)
      if (isBuy) {
        pair.volume_u = new BigNumber(pair.volume_u).plus(tx.to_amount).toNumber()
        pair.volume_u_1h = new BigNumber(pair.volume_u_1h).plus(tx.to_amount).toNumber()
        pair.volume_u_24h = new BigNumber(pair.volume_u_24h).plus(tx.to_amount).toNumber()
        pair.volume_u_4h = new BigNumber(pair.volume_u_4h).plus(tx.to_amount).toNumber()
        pair.volume_u_5m = new BigNumber(pair.volume_u_5m).plus(tx.to_amount).toNumber()

        pair.buy_volume_u_1h = new BigNumber(pair.buy_volume_u_1h).plus(tx.to_amount).toNumber()
        pair.buy_volume_u_24h = new BigNumber(pair.buy_volume_u_24h).plus(tx.to_amount).toNumber()
        pair.buy_volume_u_4h = new BigNumber(pair.buy_volume_u_4h).plus(tx.to_amount).toNumber()
        pair.buy_volume_u_5m = new BigNumber(pair.buy_volume_u_5m).plus(tx.to_amount).toNumber()

        pair.buys_tx_1h_count = pair.buys_tx_1h_count + 1
        pair.buys_tx_24h_count = pair.buys_tx_24h_count + 1
        pair.buys_tx_4h_count = pair.buys_tx_4h_count + 1
        pair.buys_tx_5m_count = pair.buys_tx_5m_count + 1

      } else {
        pair.volume_u = new BigNumber(pair.volume_u).plus(tx.from_amount).toNumber()
        pair.volume_u_1h = new BigNumber(pair.volume_u_1h).plus(tx.from_amount).toNumber()
        pair.volume_u_24h = new BigNumber(pair.volume_u_24h).plus(tx.from_amount).toNumber()
        pair.volume_u_4h = new BigNumber(pair.volume_u_4h).plus(tx.from_amount).toNumber()
        pair.volume_u_5m = new BigNumber(pair.volume_u_5m).plus(tx.from_amount).toNumber()

        pair.sell_volume_u_1h = new BigNumber(pair.sell_volume_u_1h).plus(tx.from_amount).toNumber()
        pair.sell_volume_u_24h = new BigNumber(pair.sell_volume_u_24h).plus(tx.from_amount).toNumber()
        pair.sell_volume_u_4h = new BigNumber(pair.sell_volume_u_4h).plus(tx.from_amount).toNumber()
        pair.sell_volume_u_5m = new BigNumber(pair.sell_volume_u_5m).plus(tx.from_amount).toNumber()

        pair.sells_tx_1h_count = pair.sells_tx_1h_count + 1
        pair.sells_tx_24h_count = pair.sells_tx_24h_count + 1
        pair.sells_tx_4h_count = pair.sells_tx_4h_count + 1
        pair.sells_tx_5m_count = pair.sells_tx_5m_count + 1
      }
      pair.tx_1h_count = pair.tx_1h_count + 1
      pair.tx_24h_count = pair.tx_24h_count + 1
      pair.tx_4h_count = pair.tx_4h_count + 1
      pair.tx_5m_count = pair.tx_5m_count + 1
      pair.price_change = calcNewChange(pair.price_change, price)
      pair.price_change_1h = calcNewChange(pair.price_change_1h, price)
      pair.price_change_24h = calcNewChange(pair.price_change_24h, price)
      pair.price_change_4h = calcNewChange(pair.price_change_4h, price)
      pair.price_change_5m = calcNewChange(pair.price_change_5m, price)
    }
  })
}

function calcNewChange(currentChangeRate: number, pushedPrice: number): number {
  const tokenStore = useTokenStore()
  const currentPrice = tokenStore.token?.current_price_usd || 0
  if (!currentPrice || !currentChangeRate || !pushedPrice) return 0
  const originalPrice = currentPrice / (1 + currentChangeRate / 100)
  const newChangeRate = ((pushedPrice - originalPrice) / originalPrice) * 100
  return newChangeRate
}
