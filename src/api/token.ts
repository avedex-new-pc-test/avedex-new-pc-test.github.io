// 获取 K 线历史数据
export function getKlineHistoryData(data: {
  interval: string
  pair: string
}): Promise<{
  kline_data: Array<{
    close: number
    high: number
    low: number
    open: number
    tag: string
    time: number
    volume: number
  }>
  extra_data?: {
    amount_24: number
    exchangeTime_24: number
    highestPrice_24: number
    lowestPrice_24: number
    volume_24: number
  }
}> {
  if (!data?.pair) {
    return Promise.resolve({
      kline_data: [],
      extra_data: undefined
    })
  }
  const { $api } = useNuxtApp()
  return $api(`/v1api/v4/pairs/${data.pair}/kline`, {
    method: 'get',
    query: {
      interval: data.interval,
      category: 'u',
      count: 800
    }
  })
}

// 画像描点接口 用户交易
export function getUserKlineTxTags(data: {
  interval: string
  from: number
  to: number
  pair: string
  token_address: string
  user_address?: string
}): Promise<Array<{
  sell?: {
    amount: number
    txns: number
    volume: number
  }
  buy?: {
    amount: number
    txns: number
    volume: number
  }
  time: number
}>> {
  const { $api } = useNuxtApp()
  const user_address = data?.user_address
  if (!user_address || !data?.pair) {
    return Promise.resolve([])
  }
  return $api(`/v1api/v4/pairs/${data?.pair}/kline_tx_tags`, {
    method: 'get',
    query: {
      ...data,
      user_address,
    }
  }).catch(() => {
    return Promise.resolve([])
  })
}
