import type Configs from '@/utils/json/config.json'
import type Chains from '@/utils/json/chains.json'

// 获取 chain 全局一些配置
export function getChainConfig(): Promise<typeof Chains> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/settings/swapConfigs')
}

export function getGlobalConfig(): Promise<typeof Configs> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v2/settings/globalConfig')
}

