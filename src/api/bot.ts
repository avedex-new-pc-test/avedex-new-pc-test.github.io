import Cookies from 'js-cookie'
import BigNumber from 'bignumber.js'

export function login(data: {
  username?: string
  firstName?: string
  tgUid: string
  loginAt?: number
  signature: string
  evmAddress?: string
}): Promise<{
  tgUsername: string
  tgFirstName: string
  evmAddress: string
  walletName: string
  accessToken: string
  refreshToken: string
  emailAddress: string
}> {
  const newData = {
    tgUsername: data?.username || '',
    tgFirstName: data?.firstName || '',
    tgUid: data?.tgUid || '',
    loginAt: Number(data?.loginAt || 0),
    signature: data?.signature || '',
    evmAddress: data?.evmAddress || ''
  }
  const { $api } = useNuxtApp()
  return $api('/botapi/user/login', {
    method: 'POST',
    body: newData,
  })
}
//  "emailType":"register",
//   "email":"xxx@xxx.com",
//   "refCode":"123321", -> 邀请码
//   "language":"cn",
//   "source": "ios" -> 客户端
export function sendEmailCode(data: {
  email: string
  language?: string
  emailType?: string
  refCode?: string
}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/sendEmailCode', {
    method: 'POST',
    body: {
      email: data.email,
      language: data.language || 'cn',
      emailType: data.emailType || 'register',
      refCode: data.refCode
    },
    // query: {

    // }
  })
}

export function registerEmail(data: {
  email: string
  password: string
  code: string
  language?: string
  refCode?: string
}): Promise<{
  accessToken: string
  refreshToken: string
  evmAddress: string
}> {
  const { $api } = useNuxtApp()
  const locale = useLocaleStore().locale
  return $api('/botapi/user/registerEmailAccount', {
    method: 'POST',
    body: {
      source: 'web',
      language: locale?.includes?.('zh-') ? 'cn' : 'en',
      ...data
    }
  })
}


export function loginEmail(data: {
  email: string
  password: string
}): Promise<{
  accessToken: string
  refreshToken: string
  emailAddress: string
  evmAddress: string
}> {
  const { $api } = useNuxtApp()
  const locale = useLocaleStore().locale
  return $api('/botapi/user/emailLogin', {
    method: 'post',
    body: {
      source: 'web',
      language: locale?.includes?.('zh-') ? 'cn' : 'en',
      ...data
    }
  })
}

// 邮箱验证码登录
export function emailCodeLogin(data: {
  email: string
  code: string
  refCode?: string
}): Promise<{
  accessToken: string
  evmAddress: string
  refreshToken: string
  tgUid: string
  ref1Guid: string
  walletName: string
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/emailCodeLogin', {
    method: 'post',
    body: {
      source: 'web',
      ...data
    }
  })
}

// 校验找回密码的验证码
export function verifyRecoverCode(data: {
  email: string
  code: string
}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/verifyRecoverCode', {
    method: 'post',
    body: data
  })
}

// 修改邮箱密码
export function updateEmailPassword(data: {
  email: string
  newPassword: string
  code: string
}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/updateEmailPassword', {
    method: 'post',
    body: {
      source: 'web',
      ...data
    }
  })
}

// 谷歌登录
export function googleLogin(data: {
  idToken: string
  refCode?: string
}): Promise<{
  accessToken: string
  refreshToken: string
  emailAddress: string
  evmAddress: string
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/googleLogin', {
    method: 'post',
    body: {
      source: 'web',
      ...data
    }
  })
}

// 更改当前的谷歌账户密码
export function resetPasswordGoogle(password: string): Promise<{
  accessToken: string
  refreshToken: string
  evmAddress: string
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/setGoogleAccountPassword', {
    method: 'POST',
    body: {
      password
    }
  })
}

// 设置 authenticator
export function setGoogleAuth(guid: string): Promise<{
  secret: string
  url: string
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/setAuth', {
    method: 'get',
    query: {
      guid
    }
  })
}

// 确认 authenticator
export function confirmAuthSetting(data: {
  tgUid: string
  authCode: string
}): Promise<boolean> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/confirmAuthSetting', {
    method: 'post',
    body: data
  })
}

// 查询是否已绑定authenticator(登录态之后，getUserInfoByGuid 用这个接口可以立即获取邮箱绑定)
export function getUserInfoByGuid(guid: string): Promise<{
  guid: string
  emailAddress: string // 已绑定的email address
  authSetting: boolean //  已绑定google验证器, false -> 未绑定google验证器
  ref1Guid?: string // 上游分佣绑定信息
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/getUserInfoByGuid', {
    method: 'get',
    query: {
      guid
    }
  })
}

// 绑定邮箱账号
export function bindEmailAccount(data: {
  email: string
  code: string
  password: string
  refCode?: string
}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/bindEmailAccount', {
    method: 'post',
    body: data
  })
}

// 刷新 token
export function refreshAccessToken(type: 'acc'| 'ref' ='acc'): Promise<{
  accessToken: string
  refreshToken?: string
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/refreshNewToken', {
    method: 'get',
    query: {
      type
    }
  })
}

// 获取用户钱包信息
export function getBotWallets(chain: string) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/getWallets', {
    method: 'get',
    query: {
      chain
    }
  })
}

// getWalletsAllChain
export function bot_getWalletsAllChain(params: {
  chain?: string
}={}): Promise<Array<{
  tgUid: string
  evmAddress: string
  name: string
  addresses: Array<{
    chain: string
    address: string
    price?: number
    balance?: string
  }>
}>> {
  const { $api } = useNuxtApp()

  return $api('/botapi/user/getWalletsAllChain', {
    params,
    method: 'get'
  })
}


type Setting = {
  mev: boolean
  gas: Array<{
    level: 1 | 2 | 3
    customFee: boolean
    mev: boolean
  }>
  slippage: string
  autoSell: boolean
  buyValueList: [string, string, string, string]
  sellPerList: [string, string, string, string]
}

type Chains = 'bsc' | 'base' | 'solana' | 'eth'

export function bot_getWebConfig(chain = ''): Promise<{
  [key in Chains]?: {
    selected: string
    s1: Setting
    s2: Setting
    s3: Setting
  }
}> {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/getWebConfig', {
    method: 'get',
    query: {
      chain
    }
  }).then(async res => {
    if (res && typeof res === 'object') {
      const res1: {
        [key in Chains]?: {
          selected: string
          s1: Setting
          s2: Setting
          s3: Setting
        }
      } = {}
      Object.keys(res).forEach((i) => {
        const v = res?.[i]
        if (v && isJSON(v)) {
          res1[i as Chains] = JSON.parse(v)
        }
      })
      return res1
    }
    return {}
  })
}


export function bot_updateWebConfig(data: { chain?: string, webConfig?: string } = {}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/user/updateWebConfig', {
    method: 'post',
    body: data
  })
}

// export function bot_getTokenBalance(data) {
//   return request({
//     method: 'post',
//     url: `/swap/getTokenBalance`,
//     data: {
//       chain: store.getters.chain,
//       walletAddress: store.getters.botWallet,
//       // tokens: []
//       ...data
//     }
//   })
// }

export function bot_getTokenBalance(data: {
  chain: string
  walletAddress: string
  tokens: string[]
}) {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/getTokenBalance', {
    method: 'post',
    body: data
  }).then(res => {
    return res?.map((i: { balance: any; decimals: number; token: string }) => {
      const balance = i.balance
      const decimals = i.decimals || 0
      const token = i.token === 'sol' ? 'So11111111111111111111111111111111111111112' : i.token
      return {
        ...i,
        initBalance: balance,
        balance: Number(decimals) === 0 ? balance : new BigNumber(balance).div(new BigNumber(10).pow(decimals || 0)).toFixed(),
        chain: data.chain || '',
        token
      }
    })
  })
}

// 推荐GasTip(二期)
// 返回高、中、低三档，eth用wei， solana返回lamports, solana忽略mev
export function bot_getGasTip(): Promise<Array<{ chain: string, mev: boolean, high: string, average: string, low: string, gasLimit: number }>> {
  const { $api } = useNuxtApp()
  return $api('/botapi/swap/gastip', {
    method: 'get'
  })
}


// 5.3.17. 查询预授权状态
export const bot_getApprove = createCacheRequest(function(params: {
  token: string
  chain: string
  owner: string
}) {
  const { $api } = useNuxtApp()
  return  $api('/botapi/swap/getApprove', {
    method: 'get',
    query: params
  })
}, 500)



// 预授权代币
export function bot_approve(data: {
  tokenAddress: string
  batchId: string
  chain: string
  creatorAddress: string[]
}) {
  const { $api } = useNuxtApp()
  const botStore = useBotStore()
  return $api('/botapi/swap/preApprove', {
    method: 'post',
    body: {
      // batchId: Date.now().toString(),
      // chain: store.getters.botChain,
      // creatorAddress: [store.getters.botWallet],
      tgUid: botStore.userInfo?.tgUid,
      noCb: false,
      source: 'web',
      ...data
    }
  })
}


// 创建 Solana 市价交易
export function bot_createSolTx(params: {
  batchId?: string
  swapList: Array<{
    creatorAddress: string
    inAmount: string
  }>
  inTokenAddress: string
  outTokenAddress: string
  swapType: 1 | 2
  isPrivate: boolean
  priorityFee: string
  autoSell?: boolean
  slippage: number
}) {
  const { $api } = useNuxtApp()
  const botStore = useBotStore()
  return $api('/botapi/swap/createSolTx', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      source: 'web',
      autoSell: false,
      channelRef: Cookies.get('refCode') || undefined,
      tgUid: botStore.userInfo?.tgUid,
      ...params,
    }
  })
}


// 创建Evm交易
export function bot_createSwapEvmTx(params: {
  batchId?: string
  swapList: Array<{
    creatorAddress: string
    inAmount: string
  }>
  inTokenAddress: string
  outTokenAddress: string
  swapType: 1 | 2
  contractType: 0 | 1
  isPrivate: boolean
  gasTip: number
  autoSell?: boolean
  slippage: number
}) {
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

//  创建Solana限价交易
export function bot_createSolLimitTx(params: {
  batchId?: string
  swapList: Array<{
    creatorAddress: string
    inAmount: string
  }>
  tokenAddress: string
  swapType: 5 | 6
  isPrivate: boolean
  priceLimit: string
  autoGas: 0 | 1 | 2 | 3
  priorityFee: string
  autoSell?: boolean
  slippage: number
  autoSlippage?: boolean
}) {
  const { $api } = useNuxtApp()
  const botStore = useBotStore()
  return $api('/botapi/swap/createSolLimitTx', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      source: 'web',
      tgUid: botStore.userInfo?.tgUid,
      ...params,
    }
  })
}

// 创建Evm限价交易(二期)
export function bot_createEvmLimitTx(params: {
  batchId?: string
  chain: string
  swapList: Array<{
    creatorAddress: string
    inAmount: string
  }>
  inTokenAddress: string
  outTokenAddress: string
  swapType: 5 | 6
  swapPrice: string
  contractType: 0 | 1
  isPrivate: boolean
  gasTip: number
  autoSell?: boolean
  slippage: number
  autoSlippage?: boolean
}) {
  const { $api } = useNuxtApp()
  const botStore = useBotStore()
  return $api('/botapi/swap/createEvmLimitTx', {
    method: 'post',
    body: {
      batchId: Date.now().toString(),
      tgUid: botStore.userInfo?.tgUid,
      source: 'web',
      preApprove: true,
     ...params,
    }
  })
}

