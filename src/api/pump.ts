import type { PumpConfig, PumpObj } from '@/api/types/pump'
export function _getPumpList(params): Promise<PumpObj[]> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v4/tokens/app/pump/all', {
    method: 'get',
    query: params,
  })
}
export function _getPumpConfig(): Promise<PumpConfig[]> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v4/tokens/app/pump/config')
}
