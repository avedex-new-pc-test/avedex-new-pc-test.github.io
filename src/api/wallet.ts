// 统计信息
export function getWhaleStatistics(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v1/info', {
    method: 'get',
    query: params,
  })
}

// 币种列表
export function getWhaleTokenList(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v1/tokens', {
    method: 'get',
    query: params,
  })
}

// 动态列表
export function getWhaleTrendList(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v1/events', {
    method: 'get',
    query: params,
  })
}

// 修改钱包备注
export function updateWhaleRemark(params) {
  const {$api} = useNuxtApp()
  return $api('/v2api/walletinfo/v1/remark', {
    method: 'post',
    body: params
  })
}

// 个人Token详情统计信息
export function getTokenStatistics(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/token/v1/user/analysis', {
    method: 'get',
    query: params,
  })
}

// 个人Token详情列表
export function getTokenDetailsList(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/token/v1/user/events', {
    method: 'get',
    query: params,
  })
}

// 个人Token详情曲线
export function getTokenDetailLine(pair, params) {
  const { $api } = useNuxtApp()
  return $api(`/v1api/v4/pairs/${pair}/sub_kline`, {
    method: 'get',
    query: params,
  })
}

// 个人Token详情曲线打点
export function getTokenDetailMarks(pair, params) {
  const { $api } = useNuxtApp()
  return $api(`/v2api/token/v1/user/${pair}/kline_event_tags`, {
    method: 'get',
    query: params,
  })
}

// 钱包基础信息
//https://tsgrysq47oqo.sg.larksuite.com/wiki/NeenwruPiiJWQDkgnOClkMn9guf?fromScene=spaceOverview
export function getWalletBasicInfo(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/info', {
    method: 'get',
    query: params,
  })
}

// 交易分析
export function getTxAnalysis(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/tx_analysis', {
    method: 'get',
    query: params,
  })
}

// 活动分析
export function getEventsAnalysis(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/events_analysis', {
    method: 'get',
    query: params,
  })
}

// balance /pnl信息
export function getBalanceAnalysis(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/balance_analysis', {
    method: 'get',
    query: params,
  })
}

// 交易分析详情
export function getEventsAnalysisDetail(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/events_analysis_detail', {
    method: 'get',
    query: params,
  })
}

// 发币记录
export function getDeployedTokens(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/deployed_tokens', {
    method: 'get',
    query: params,
  })
}

// 获取黑白名单
export function getTokenFilterList(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/tokenfilterv2', {
    method: 'get',
    query: params,
  })
}

// bindTwitter
export function bindTwitter(params) {
  const { $api } = useNuxtApp()
  return $api('/v2api/walletinfo/v2/cache_x_callback', {
    method: 'get',
    query: params,
  })
}


