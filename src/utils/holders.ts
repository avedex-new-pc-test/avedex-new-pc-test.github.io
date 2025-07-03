
interface ChartColorConfig {
  color: string
  areaStyleColor: string
  data: string
}
const chartColorMap: Record<string, ChartColorConfig> = {
    top100_amount: {
      color: '#FB6300', // top100
      areaStyleColor: '#5b3f52',
      data: 'top100_amount',
    },
    '16': {
      color: '#D741E3', // 老鼠仓
      areaStyleColor: '#ac3eec33',
      data: 'insider_balance_ratio',
    },
    '19': {
      color: '#3F80F7', // 狙击
      areaStyleColor: '#3F80F733',
      data: 'sniper_balance_ratio',
    },
    '25': {
      color: '#41CEE3', // DEV
      areaStyleColor: '#749f8333',
      data: 'dev_balance_ratio',
    },
    '30': {
      color: '#C23531', // 聪明钱
      areaStyleColor: '#c2353133',
      data: 'smartmoney_balance_ratio',
    },
    '31': {
      color: '#5E5CE6', // KOL
      areaStyleColor: '#5e5ce61a',
      data: 'kol_balance_ratio',
    },
}
export function filterChartColor(type: string): ChartColorConfig | undefined {
  return chartColorMap[type] || ''
}
