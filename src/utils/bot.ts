import langs from './json/botLang.json'
import Cookies from 'js-cookie'

export function formatBotError(msg: string) {
  const locale = localStorage.language
  if (locale?.includes('zh')) {
    const msgsTimeout = [
      'transaction confirmation on chain timeout',
      'transaction confirmation on chain timeout, please check on solscan',
      'bundle confirmation on chain timeout, please check on solscan',
      'transaction already sent but confirmation on chain timeout',
      'transaction confirmation on chain timeout, please check message hash in tonviewer',
    ]
    if (msgsTimeout?.some?.((i) => msg?.includes?.(i))) {
      return '链上交易确认超时, 自行查看交易状态'
    }
    const timeoutMsgs = ['Limit Swap Time Out', 'auto cancelled due to timeout']
    if (timeoutMsgs?.some?.((i) => new RegExp(i, 'gi').test(msg))) {
      return '限价单时间到期'
    }
    if (new RegExp('auto cancelled due to no token', 'gi').test(msg)) {
      return '在其他订单中, 已卖空该token'
    }
    if (new RegExp('auto cancel when limit sell token out', 'gi').test(msg)) {
      return '在其他订单中, 已卖空该token'
    }
    if (
      new RegExp(
        'Please avoid placing orders with the same amount at similar prices. You can either use a different trade amount, or more than 40% of the price difference from other orders for the same token',
        'gi'
      ).test(msg)
    ) {
      return '请避免以相似的价格下相同数量的订单。您可以使用不同的交易金额，也可以使用相同代币与其他订单差价的40%以上。'
    }
    return (langs as Record<string, string>)?.[msg] || msg
  } else if (locale?.includes('en')) {
    if (msg === 'insufficient balance') {
      return 'Insufficient balance. Keep at least 0.006 SOL after the transaction.'
    }
  }
  return msg
}

export function handleBotError(err: any) {
  const msg =
    typeof err === 'string'
      ? err
      : err?.data?.message || err?.message || err?.msg
  ElNotification({ title: 'Error', type: 'error', message: formatBotError(msg) })
}

export function tgLogin() {
  let url = `https://t.me/AveSniperBot?start=lg-`
  const config = useRuntimeConfig()
  const baseUrl = config?.public?.apiBase as string
  // test
  if (baseUrl === 'https://0ftrfsdb.xyz') {
    url = `https://t.me/ave_sniper_bot?start=lg-`
  }

  let domains = [
    'avedex.cc',
    'ave.ai',
    'opencw.online',
    'aveapi.online',
    'avechat.site',
    'aveios.com',
    'aoandroid.cloud',
    'aoh5pc.com',
    'aveaidata.com',
    'aveaiweba.github.io',
    'ave-m-test-7.github.io',
    'ave00.com',
  ]
  let domain = window.location.hostname
  let index = domains.indexOf(domain) + 1
  let path = '1'
  if (index > 0) {
    path = String(index)
  }
  let pathname = window.location.pathname
  let refCode = Cookies.get('refCode') ? `-${Cookies.get('refCode')}` : ''
  if (pathname?.includes('/token/')) {
    let { address, chain } = getAddressAndChainFromId(
      pathname?.replace?.('/token/', '')
    )
    if (address && chain) {
      chain = chain.slice(0, 2)
      path = path + `-${chain}-${address}` + refCode
    }
  } else {
    path = path + refCode
  }
  url = url + path
  window.open(url)
}
