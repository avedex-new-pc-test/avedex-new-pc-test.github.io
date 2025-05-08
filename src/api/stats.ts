export function getTotalHolders(token_id: string): Promise<Array<{
  cn: string
  en: string
  es: string
  pt: string
  tw: string
  type: string
  total_address: number
}>> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/alltags/totalholders', {
    method: 'get',
    query: {
      token_id
    }
  })
}
