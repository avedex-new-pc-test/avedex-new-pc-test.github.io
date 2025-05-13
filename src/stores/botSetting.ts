import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { deepMerge } from '@/utils/index'
import { isEqual } from 'lodash-es'
import { useBotStore } from './bot'

export const useBotSettingStore = defineStore('botSetting', () => {
   const defaultSettings = {
    mev: false,
    gas: [
      {
        level: 1,
        customFee: '',
        isCustom: false,
        mev: true
      },
      {
        level: 1,
        customFee: '',
        isCustom: false,
        mev: false
      },
    ],
    slippage: '9',
    autoSell: false,
    buyValueList: ['0.1', '0.5', '1', '5'],
    sellPerList: ['25', '50', '75', '100']
  }
  const chains = ['solana', 'eth', 'bsc', 'base']
  type Setting = typeof defaultSettings
  const settings: {
    [key in typeof chains[number]]?: {
      selected: string
      s1: Setting
      s2: Setting
      s3: Setting
    }
  } = {}
  chains.forEach(chain => {
    const s = { ...defaultSettings }
    if (chain === 'base') {
      s.buyValueList = ['0.01', '0.02', '0.5', '1']
    }
    settings[chain] = {
      selected: 's1',
      s1: s,
      s2: s,
      s3: s
    }
  })
  const botSettings = useLocalStorage('bot_settings_v3', settings, { mergeDefaults: (storageValue, defaults) => deepMerge(defaults, storageValue) })

  chains.forEach(i => {
    watch(() => botSettings.value[i], (val, oldVal) => {
      if (!isEqual(val, oldVal)) {
        console.log('botSettings update', i, val)
        useBotStore().updateWebConfig({
          chain: i,
          webConfig: JSON.stringify(val)
        })
      }
    })
  })
  return {
    botSettings
  }
})
