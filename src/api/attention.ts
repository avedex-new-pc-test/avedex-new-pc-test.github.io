// 用户取消关注
export async function deleteAttention(body: {
  user_address: string, user_chain: string, address: string
}) {
  const {$api} = useNuxtApp()
  return $api('/v1api/v3/users/fav/deleteUser', {
    method: 'post',
    body,
  }).catch((err) => console.log(err))
}

// 用户添加关注
export async function addAttention(body: {
  user_address: string, user_chain: string, remark?: string, address: string
}) {
  const {$api} = useNuxtApp()
  return $api('/v1api/v3/users/fav/addUser', {
    method: 'post',
    body
  })
}
