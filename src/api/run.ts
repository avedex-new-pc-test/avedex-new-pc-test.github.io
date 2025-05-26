export function _getRugPull(token_id: string) {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/rugpullrate', {
    method: 'get',
    query: {
      token_id: token_id,
    },
  })
}
export function _getRugPullList(params: { token_id: string; pageNO: number; pageSize : number}) {
  const { $api } = useNuxtApp()
  return $api('/v1api/v3/stats/rugpulldev', {
    method: 'get',
    query: params,
  })
}
