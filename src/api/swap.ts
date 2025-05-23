import Cookies from 'js-cookie'

interface GetUserBalanceResponse {
  address: string
  token: string
  chain: string
  symbol: string
  logo_url: string
  balance: number | string
  balance_usd: number
  total_profit: string
  total_profit_ratio: string
  average_purchase_price_usd: string
  current_price_usd: number
  price_change: number
  decimals: number
  risk_level: number
  risk_score: number
}

function getUserBalance(
  {
    pageNO = 1,
    pageSize = 10,
    user_ids = [] as string[],
    sort = 'balance_usd',
    sort_dir = 'desc',
    hide_risk = 1,
    hide_small = 0
  }): Promise<{ data: GetUserBalanceResponse[] }> {
  const { $api } = useNuxtApp()
  return $api('/v2api/user_balance/v1/swap/balance', {
    method: 'post',
    body: {
      user_ids, //钱包ID
      sort,     // 排序字段，支持：balance_usd、total_profit
      sort_dir, //desc:倒序，asc:正序
      pageSize,
      pageNO,
      hide_risk,  //是否隐藏高分险。0:不隐藏高风险; 1：隐藏高分险;
      hide_small  //是否隐藏小额。 大于0时:balance_usd > hide_small; 其他：不参与过滤
    }
  })
}

interface GetTokenBalanceRequest {
  chain: string
  walletAddress: string
  tokens: string[]
}

interface GetTokenBalanceResponse {
  chain: string
  walletAddress: string
  token: string
  name: string
  symbol: string
  decimals: number
  balance: string
}


function getTokenBalance(body: GetTokenBalanceRequest): Promise<GetTokenBalanceResponse[]> {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/getTokenBalance', {
    method: 'post',
    body
  })
}

const getApprove = createCacheRequest(function (query: {
  chain: string
  owner: string
  token: string
}): Promise<string> {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/getApprove', {
    method: 'get',
    query
  })
}, 500)

function approve(data) {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/preApprove', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      noCb: false,
      source: 'web',
      ...data
    }
  })
}

// 查询sol bundle是否可用
function getBundleAvailable() {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/getBundleAvailable', {
    method: 'get',
  })
}

// 创建 Solana 市价交易
function createSolTx(params) {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/createSolTx', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      source: 'web',
      autoSell: false,
      channelRef: Cookies.get('refCode') || undefined,
      ...params,
    }
  })
}

// 创建Evm交易
function createSwapEvmTx(params) {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/createSwapEvmTx', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      source: 'web',
      autoSell: false,
      preApprove: true,
      channelRef: Cookies.get('refCode') || undefined,
      ...params,
    }
  })
}

export {
  getUserBalance,
  getTokenBalance,
  getApprove,
  approve,
  createSolTx,
  createSwapEvmTx
}

export type { GetUserBalanceResponse, GetTokenBalanceResponse }
