import type { WSTx } from '~/pages/token/components/kLine/types'
import BigNumber from 'bignumber.js'
import type { Profile } from '~/api/token'

export function updatePriceFromTx(tx: WSTx) {
  const tokenStore = useTokenStore()
  if (tx.to_address !== tokenStore.token?.token && tx.from_address !== tokenStore.token?.token) return
  const isBuy = tx.to_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.()
  const price = Number(tx.from_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.() ? tx.from_price_usd : tx.to_price_usd) || 0
  if (tx.pair_address === tokenStore.pairAddress) {
    if (price) {
      tokenStore.tokenPrice = price
    }
  }
  tokenStore?.pairs?.forEach(pair => {
    if (pair.pair === tx.pair_address) {
      const isToken0From = tx.from_address?.toLowerCase?.() === pair.token0_address?.toLowerCase?.()
      const isToken1From = tx.from_address?.toLowerCase?.() === pair.token1_address?.toLowerCase?.()
      const isToken0To = tx.to_address?.toLowerCase?.() === pair.token0_address?.toLowerCase?.()
      const isToken1To = tx.to_address?.toLowerCase?.() === pair.token1_address?.toLowerCase?.()
      const price = Number(tx.from_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.() ? tx.from_price_usd : tx.to_price_usd) || 0
      const currentPrice = pair.token0_address?.toLowerCase?.() === tokenStore.token?.token?.toLowerCase?.() ? pair.token0_price_usd : pair.token1_price_usd
      if (isToken0From || isToken0To) {
        pair.reserve0 = Number(isToken0From ? tx.from_reserve : tx.to_reserve)
        pair.token0_price_usd = Number(isToken0From ? tx.from_price_usd : tx.to_price_usd)
      } else {
        pair.reserve1 = Number(isToken1From ? tx.from_reserve : tx.to_reserve)
        pair.token1_price_usd = Number(isToken1From ? tx.from_price_usd : tx.to_price_usd)
      }
      if (isToken1From || isToken1To) {
        pair.reserve1 = Number(isToken1From ? tx.from_reserve : tx.to_reserve)
        pair.token1_price_usd = Number(isToken1From ? tx.from_price_usd : tx.to_price_usd)
      } else {
        pair.reserve0 = Number(isToken0From ? tx.from_reserve : tx.to_reserve)
        pair.token0_price_usd = Number(isToken0From ? tx.from_price_usd : tx.to_price_usd)
      }
      if (isBuy) {
        const volume = new BigNumber(tx.to_amount).times(price) || 0
        pair.volume_u = new BigNumber(pair.volume_u).plus(volume).toNumber()
        pair.volume_u_1h = new BigNumber(pair.volume_u_1h).plus(volume).toNumber()
        pair.volume_u_24h = new BigNumber(pair.volume_u_24h).plus(volume).toNumber()
        pair.volume_u_4h = new BigNumber(pair.volume_u_4h).plus(volume).toNumber()
        pair.volume_u_5m = new BigNumber(pair.volume_u_5m).plus(volume).toNumber()

        pair.buy_volume_u_1h = new BigNumber(pair.buy_volume_u_1h).plus(volume).toNumber()
        pair.buy_volume_u_24h = new BigNumber(pair.buy_volume_u_24h).plus(volume).toNumber()
        pair.buy_volume_u_4h = new BigNumber(pair.buy_volume_u_4h).plus(volume).toNumber()
        pair.buy_volume_u_5m = new BigNumber(pair.buy_volume_u_5m).plus(volume).toNumber()

        pair.buys_tx_1h_count = pair.buys_tx_1h_count + 1
        pair.buys_tx_24h_count = pair.buys_tx_24h_count + 1
        pair.buys_tx_4h_count = pair.buys_tx_4h_count + 1
        pair.buys_tx_5m_count = pair.buys_tx_5m_count + 1

      } else {
        const volume = new BigNumber(tx.from_amount).times(price) || 0
        pair.volume_u = new BigNumber(pair.volume_u).plus(volume).toNumber()
        pair.volume_u_1h = new BigNumber(pair.volume_u_1h).plus(volume).toNumber()
        pair.volume_u_24h = new BigNumber(pair.volume_u_24h).plus(volume).toNumber()
        pair.volume_u_4h = new BigNumber(pair.volume_u_4h).plus(volume).toNumber()
        pair.volume_u_5m = new BigNumber(pair.volume_u_5m).plus(volume).toNumber()

        pair.sell_volume_u_1h = new BigNumber(pair.sell_volume_u_1h).plus(volume).toNumber()
        pair.sell_volume_u_24h = new BigNumber(pair.sell_volume_u_24h).plus(volume).toNumber()
        pair.sell_volume_u_4h = new BigNumber(pair.sell_volume_u_4h).plus(volume).toNumber()
        pair.sell_volume_u_5m = new BigNumber(pair.sell_volume_u_5m).plus(volume).toNumber()

        pair.sells_tx_1h_count = pair.sells_tx_1h_count + 1
        pair.sells_tx_24h_count = pair.sells_tx_24h_count + 1
        pair.sells_tx_4h_count = pair.sells_tx_4h_count + 1
        pair.sells_tx_5m_count = pair.sells_tx_5m_count + 1
      }
      pair.tx_1h_count = pair.tx_1h_count + 1
      pair.tx_24h_count = pair.tx_24h_count + 1
      pair.tx_4h_count = pair.tx_4h_count + 1
      pair.tx_5m_count = pair.tx_5m_count + 1

      pair.price_change = calcNewChange(pair.price_change, price, currentPrice)
      pair.price_change_1h = calcNewChange(pair.price_change_1h, price, currentPrice)
      pair.price_change_24h = calcNewChange(pair.price_change_24h, price, currentPrice)
      pair.price_change_4h = calcNewChange(pair.price_change_4h, price, currentPrice)
      pair.price_change_5m = calcNewChange(pair.price_change_5m, price, currentPrice)
    }
  })

  // 更新 holders
  if (tx.profile) {
    const profile: Profile = JSON.parse(tx.profile)
    const token = tokenStore.token.token.toLowerCase()
    if ((profile.token0Address.toLowerCase() === token && profile.token0HasNewAccount) || (profile.token1Address.toLowerCase() === token && profile.token1HasNewAccount)) {
      tokenStore.token.holders = tokenStore.token.holders + 1
    }
    if ((profile.token0Address.toLowerCase() === token && profile.token0HasClearedAccount) || (profile.token1Address.toLowerCase() === token && profile.token1HasClearedAccount)) {
      tokenStore.token.holders = tokenStore.token.holders - 1
    }
  }
}

function calcNewChange(
  currentChangeRate: number,
  pushedPrice: number,
  currentPrice?: number
): number {
  const tokenStore = useTokenStore()
  const cp = new BigNumber(currentPrice ?? tokenStore.token?.current_price_usd ?? 0)

  if (!cp.isFinite() || !Number.isFinite(currentChangeRate) || !Number.isFinite(pushedPrice)) {
    return 0
  }
  const originalPrice = cp.div(1 + (currentChangeRate / 100))
  return new BigNumber(pushedPrice)
    .minus(originalPrice)
    .div(originalPrice)
    .times(100)
    .toNumber()
}
