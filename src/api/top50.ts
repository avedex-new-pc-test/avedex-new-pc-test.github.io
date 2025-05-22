interface NewTags {
  cn: 'string'
  color: 'string'
  en: 'string'
  es: 'string'
  extra_info: null
  icon: 'string'
  ja: 'string'
  nick_name: 'string'
  pt: 'string'
  tr: 'string'
  tw: 'string'
  type: 'string'
}
interface EarlyHolders {
  account_address: string
  new_tags: Array<NewTags>
  tag: string
  tag_type: number
}
export function _getEarlyholders(
  token_id: string
): Promise<Array<EarlyHolders>> {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/earlyholders', {
    method: 'get',
    query: {
      token_id,
    },
  })
}
