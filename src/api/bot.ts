export function bot_login(data: {
  username: string
  firstName: string
  tgUid: string
  loginAt: number
  signature: string
  evmAddress: string
}): Promise<{
  tgUsername: string
  tgFirstName: string
  evmAddress: string
  walletName: string
  accessToken: string
  refreshToken: string
  emailAddress: string
}> {
  const newData = {
    tgUsername: data?.username || '',
    tgFirstName: data?.firstName || '',
    tgUid: data?.tgUid || '',
    loginAt: Number(data?.loginAt || 0),
    signature: data?.signature || '',
    evmAddress: data?.evmAddress || ''
  }
  const { $api } = useNuxtApp()
  return $api('/v1api/bot/login', {
    method: 'POST',
    body: newData,
  })
}

export function sendEmailCode(data: {
  email: string
  language?: string
  emailType?: string
}) {
  const { $api } = useNuxtApp()
  return $api('/v1api/bot/sendEmailCode', {
    method: 'POST',
    body: {
      email: data.email,
      language: data.language || 'cn',
      emailType: data.emailType || 'register'
    },
    // query: {

    // }
  })
}
