import timezoneObj from './json/timezone.json'
import dayjs from './day'
import sha1 from 'crypto-js/sha1'
import { PublicKey } from '@solana/web3.js'
import { TronWeb } from 'tronweb'
import TonWeb from 'tonweb'
import IconUnknown from '@/assets/images/icon-unknown.png'

export function isJSON (str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    console.log(e)
    return false
  }
  return true
}

export function formatDate(val: string | number | Date, dateType = 'YYYY-MM-DD HH:mm:ss') {
  let dateStr: Date | null = null
  let timeStamp: number | string = 0
  let str
  if (typeof val === 'object' && val instanceof Date) {
    dateStr = val
  } else {
    if (String(val).length <= 10) {
      timeStamp = Number(Number(val) * 1000)
    } else {
      timeStamp = Number(val)
    }
    if (!timeStamp) {
      timeStamp = val
    }
    dateStr = new Date(timeStamp)
  }

  str = dateType.replace('YYYY', String(dateStr.getFullYear()))
  str = str.replace('MM', (dateStr.getMonth() + 1 < 10 ? '0' : '') + (dateStr.getMonth() + 1))
  str = str.replace('DD', (dateStr.getDate() < 10 ? '0' : '') + dateStr.getDate())
  str = str.replace('HH', (dateStr.getHours() < 10 ? '0' : '') + dateStr.getHours())
  str = str.replace('mm', (dateStr.getMinutes() < 10 ? '0' : '') + dateStr.getMinutes())
  str = str.replace('ss', (dateStr.getSeconds() < 10 ? '0' : '') + dateStr.getSeconds())

  return str
}

// 根据数字获取 precision 和 minMove
export function formatDecimals(n: number | string, decimals = 3) {
  let n1 = Number(n) || 0
  let d = 0
  while (n1 < 0.1 && n1 !== 0) {
    n1 = n1 * 10
    d++
  }
  let result = d + decimals
  if (n1 < 1) {
    result = result + 1
  }
  result = result === 11 ? 10 : result > 16 ? 16 : result
  return {
    precision: result,
    minMove: Number('0.' + '0'.repeat(result - 1) + '1')
  }
}

export function getTimezone() {
  const timezone = dayjs.tz.guess()
  const tO: { [key: string]: number } = timezoneObj
  if (tO[timezone]) {
    return timezone
  } else {
    let offset = dayjs().utcOffset()
    const a = Object.keys(timezoneObj)
    for (let i = 0; i < a.length; i++) {
      const cur = a[i]
      if (tO[cur] * 60 === offset) {
        return cur
      }
    }
    offset = Math.round(offset / 60) * 60
    for (let i = 0; i < a.length; i++) {
      const cur = a[i]
      if (tO[cur] * 60 === offset) {
        return cur
      }
    }
  }
}

export function getAddressAndChainFromId(id: string, type: 1): [string, string]
export function getAddressAndChainFromId(id: string, type?: number): { address: string; chain: string }
export function getAddressAndChainFromId(id: string, type: number = 0) {
  if (!id || !id.includes('-')) {
    if (type === 1) {
      return ['', ''] as [string, string]
    }
    return { address: '', chain: '' }
  }

  const address = id.replace(/-[^-]+$/, '')
  const chain = id.slice(address.length + 1) // 更安全、性能更好

  if (type === 1) {
    return [address, chain] as [string, string]
  }

  return { address, chain }
}

// 传去 时间长度 返回 格式化的时间
export function formatTime(time: number | string) {
  if (!time) {
    return 0
  }
  if (Number(time) < 0) {
    time = 0
  }
  if (typeof time === 'string') {
    time = Number(time)
  }
  if (time < 60) {
    return `${Math.floor(time)}s`
  }
  if (time < 3600) {
    return `${Math.floor(time / 60)}m`
  }
  if (time < 3600 * 24) {
    return `${Math.floor(time / 3600)}h`
  }
  return `${Math.floor(time / 3600 / 24)}d`
}

export function formatTimeFromNow(val: number | string, isNum = false) {
  let timeStamp: number | string = Number(Number(val) * 1000)
  if (!timeStamp) {
    timeStamp = val
  }
  const dateStr = new Date(timeStamp)
  let time = Math.floor((Date.now() - dateStr.getTime()) / 1000)
  if (time < 0) {
    time = 0
  }
  if (isNum) {
    return time
  }
  return formatTime(time)
}

export function formatUrl(url: string) {
  if (!url) {
    return ''
  }
  if (url?.includes('://')) {
    return url
  }
  return 'https://' + url
}


export function getChainInfo(chain: string) {
  const chainConfig = useConfigStore().chainConfig
  const chainInfo = chainConfig?.find(item => item.net_name === chain)
  if (!chainInfo) {
    return {} as Record<string, any>
  }
  return chainInfo
}

export function getSwapInfo(chain: string | { chain: string; amm: string }, amm?: string) {
  const chainConfig = useConfigStore().chainConfig
  if (typeof chain === 'string') {
    const chainInfo = chainConfig?.find(item => item.net_name === chain)
    if (!chainInfo) {
      return {} as Record<string, any>
    }
    return chainInfo?.swaps?.find?.(item => item.name === amm)
  } else {
    const chainInfo = chainConfig?.find(item => item.net_name === chain.chain)
    if (!chainInfo) {
      return {} as Record<string, any>
    }
    return chainInfo?.swaps?.find?.(item => item.name === chain.amm)
  }
}

export function getTagTooltip(i: {
  tag?: string;
  smart_money_buy_count_24h: number;
  smart_money_sell_count_24h: number;
}) {
  const $t = getGlobalT()
  if (!i.tag) {
    if (i.smart_money_buy_count_24h > 0 || i.smart_money_sell_count_24h > 0) {
      return $t('smart_money_tips', {
        b: i.smart_money_buy_count_24h,
        s: i.smart_money_sell_count_24h,
      })
    }
    return ''
  }
  const tips: Record<string, string> = {
    kol_sell: $t('kol_sell_tips'),
    kol_buy: $t('kol_buy_tips'),
    smarter_buy: $t('smarter_buy_tips'),
    smarter_sell: $t('smarter_sell_tips'),
  }
  return tips?.[i.tag] || $t(i.tag)
}


// 根据字符串生成头像
export function generateAvatarIcon(string: string) {
  const hashBuffer = sha1(string)
  const hash = hashBuffer.toString()
  const width = 80
  const height = 80
  const pixelSize = 10
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const color1 = '#' + hash.slice(0, 6)
  const color2 = '#' + hash.slice(6, 12)
  const color3 = '#' + hash.slice(12, 18)
  const columns = Math.floor(width / pixelSize)
  const rows = Math.floor(height / pixelSize)
  const halfColumns = Math.floor((columns + 1) / 2)
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < halfColumns; column++) {
      const xPos = column * pixelSize
      const yPos = row * pixelSize
      const colorChoice = (row * halfColumns + column) % 3
      let color
      switch (colorChoice) {
        case 0:
          color = color1
          break
        case 1:
          color = color2
          break
        case 2:
          color = color3
          break
        default:
          color = color1
          break
      }
      if (ctx) {
        ctx.fillStyle = color
        ctx.fillRect(xPos, yPos, pixelSize, pixelSize)
        ctx.fillRect(width - xPos - pixelSize, yPos, pixelSize, pixelSize)
      }
    }
  }
  return canvas.toDataURL('image/png')
}


export function isValidAddress(address: string, chain = 'eth') {
  if (chain === 'solana') {
    try {
      new PublicKey(address)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }
  if (chain === 'tron') {
    return TronWeb.isAddress(address)
  }
  if (chain === 'sui') {
    const suiReg = /^[0-9a-zA-Z]{66}$/
    return suiReg.test(address)
  }
  if (chain === 'ton') {
    return TonWeb.utils.Address.isValid(address) || false
  }
  if (chain === 'brc20') {
    const btcReg = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,62}$/
    return btcReg.test(address)
  }
  if (getChainInfo(chain)?.vm_type === 'evm') {
    const hexReg = /^0x[0-9a-zA-Z]{40}$/
    return hexReg.test(address)
  }
  return false
}

export function formatSwapUrl(address: string, chain: string, amm: string) {
  const swapInfo = getSwapInfo(chain, amm)
  const swapUrl = swapInfo?.swap_url
  if (swapInfo && swapUrl) {
    if (typeof swapUrl === 'string') {
      return swapUrl + address
    } else if (swapUrl?.[amm]) {
      return swapUrl?.swapUrl?.[amm] + address
    } else {
      return ''
    }
  }
  return ''
}

export function formatExplorerUrl(chain: string, address: string, type: 'token' | 'address' | 'tx' = 'token') {
  const chainInfo = getChainInfo(chain)
  if (chain === 'halo') {
    if (type === 'tx') {
      address = address?.replace?.(/^0x/, '')
    }
  }
  const keyUrl = type + '_url' as 'token_url' | 'address_url' | 'tx_url'
  const url = chainInfo?.[keyUrl]
  if (url) {
    return url.replace(`{${type}}`, address)
  }
  const n = chainInfo ? chainInfo.block_explorer_url : ''
  let type1: 'tokenAddr' | 'account' | 'token20' | 'contract' | 'transaction' | 'txs' | typeof type = type
  if (chain === 'oec' && type === 'token') {
    type1 = 'tokenAddr'
  }
  if (chain === 'solana' && type === 'address') {
    type1 = 'account'
  }

  if (chain === 'nervos') {
    if (type === 'address' || type === 'token') {
      type1 = 'account'
    }
  }

  if (chain === 'tron') {
    if (type === 'token') {
      type1 = 'token20'
    } else if (type === 'address') {
      type1 = 'contract'
    } else if (type === 'tx') {
      type1 = 'transaction'
    }
  }

  if (chain === 'osmosis') {
    type1 = 'txs'
  }

  if (chain === 'vision') {
    if (type === 'token') {
      type1 = 'token20'
    } else if (type === 'tx') {
      type1 = 'transaction'
    }
  }

  return `${n}/${type1}/${address}`
}

export function openBrowser(url: string, type: 'token' | 'address' | 'tx', chain: string) {
  let newUrl = url
  if (type) {
    newUrl = formatExplorerUrl(chain, url, type)
  }
  if (!newUrl) {
    return
  }
  window.open(newUrl)
}



export function getChainDefaultIconColor(chain: string) {
  const theme = useThemeStore().theme
  const defaultColor = theme === 'dark' ? '#333333' : '#999999'
  if (!chain) {
    return defaultColor
  }
  const colors: Record<string, string> = {
    solana: '#C931F7',
    eth: '#627EEA',
    bsc: '#F0B90A',
    tron: '#C53027',
    sui: '#6FBCF0',
    ton: '#0099E9',
    base: '#0152FF',
  }

  return colors?.[chain] || defaultColor
}

export function getChainDefaultIcon(chain: string, text = '') {
  if (text) {
    const color = getChainDefaultIconColor(chain)
    const defaultSvg = `<?xml version="1.0" standalone="no"?><svg width="32" height="32" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="50%" cy="50%" r="16" stroke="transparent" fill="${color}" stroke-width="0"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#fff">${text
      ?.slice(0, 1)
      ?.toUpperCase?.()}</text>
    </svg>`
    try {
      return (
        'data:image/svg+xml;base64,' +
        window.btoa(unescape(encodeURIComponent(defaultSvg)))
      )
    } catch (err) {
      console.log(err)
      return ''
    }
  }
  return '/icon-default.png'
}

export function formatIconTag(src: string) {
  const urlPrefix = useConfigStore().globalConfig?.token_logo_url || 'https://www.iconaves.com/'
  return src && src !== 'unknown'
    ? `${urlPrefix}signals/${src}.png`
    : IconUnknown
}

export function deepMerge(target: any, source: any) {
  if (Array.isArray(target) && Array.isArray(source)) {
    // 如果是数组，直接覆盖
    return source
  } else if (typeof target === 'object' && typeof source === 'object') {
    // 对象的合并逻辑
    const result = { ...target }
    for (const key in source) {
      // eslint-disable-next-line no-prototype-builtins
      if (target.hasOwnProperty(key)) {
        // 如果目标对象中已有该键，递归合并
        result[key] = deepMerge(target[key], source[key])
      } else {
        // 如果目标对象中没有该键，直接添加
        result[key] = source[key]
      }
    }
    return result
  } else {
    // 基本类型覆盖
    return source
  }
}

