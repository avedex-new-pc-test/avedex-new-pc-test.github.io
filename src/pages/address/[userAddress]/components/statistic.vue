<template>
  <div class="statistic p-[20px]">
    <div>
      <div class="statistic-avatar">
        <UserAvatar
          :key="statistics?.wallet_logo?.logo"
           :wallet_logo="{
            ...(statistics.wallet_logo || {}),
            ...(address === botStore?.evmAddress ? { name: userInfo?.name } : {}),
          }"
          :address="address"
          :chain="chain"
          iconSize="60px"
        />
        <div>
          <div class="flex-start" style="margin-bottom: 6px">
            <UserRemark
              :key="address"
              class="statistic-name"
              :address="address"
              :remark="defaultRemark"
              :chain="chain"
              :wallet_logo="statistics.wallet_logo"
              iconEditSize="16px"
              :maxRemarkLength="15"
              @updateRemark="onGetWalletBasicInfo"
            />
            <a
              v-if="statistics.x_url"
              class="statistic-media-right flex-center"
              :href="statistics.x_url"
              target="_blank"
            >
              <img v-if="isDark" :width="16" src="@/assets/images/connect-x-dark.png" alt="" />
              <img v-else :width="16" src="@/assets/images//connect-x-light.png" alt="" />

              {{ formatNumber2(statistics.x_followers, 2, 4, 4) }}
            </a>
            <a
              v-else-if="isSelfAddress"
              class="statistic-media-right flex-center pointer"
              @click="_bindTwitter"
            >
              <i class="iconfont icon-twitter2" />
              {{ $t('connect') }}
            </a>
          </div>
          <div class="statistic-media">
            <div v-copy="address" class="statistic-address">
              <div class="statistic-address-copy flex-center">
                {{ addressText }}
                <Icon  name="bxs:copy" class="text-[10px] clickable"/>
              </div>
            </div>
            <div class="statistic-media-left">
              <i class="iconfont icon-time" />
              <span>{{ wallet_age?.value }}</span>
              <span>{{ wallet_age?.unit }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="statistic-money">
        <strong class="statistic-money-sum">
          {{ uSymbol }}{{ total_balance }} {{ main_token_symbol }}
        </strong>

        <el-switch v-model="currencyStandard" inactive-value="U" :active-value="chain">
          <template #active-action>
            <ChainToken :chain="chain" :width="16" />
          </template>
          <template #inactive-action>
            <span class="statistic-money-u">$</span>
          </template>
        </el-switch>
      </div>
      <p class="total-profit">
        {{ $t("totalPnL") }}（{{ intervalText }}）
        <Number :value="statistics.profit" :signVisible="isUSDT">
          {{ formatNumber2(Math.abs((statistics.profit ?? 0) / main_token_price), 2, 4, 4) }} {{ main_token_symbol }}
        </Number>
        <Number :value="statistics.profit_ratio">
          {{ formatNumberS(Math.abs((statistics?.profit_ratio ?? 0) * 100), 2) }}%
        </Number>
      </p>
      <p class="total-profit">
        {{ $t("winRate2") }}（{{ intervalText }}）
        <Number :value="statistics.win_rate">
          {{formatNumberS(Math.abs(statistics.win_rate ?? 0))}}%
        </Number>
      </p>
    </div>
    <div class="statistic-right">
      <div class="statistic-operations">
        <a
          v-if="statistics.is_wallet_address_fav === 1"
          class="statistic-right-attention statistic-right-attention-followed"
          @click="_deleteAttention"
        >
          <i class="iconfont icon-yiguanzhu" />
          <span class="statistic-right-attention-text">{{ $t('followed') }}</span>
          <span class="statistic-right-attention-cancel">{{ $t('cancelFollowed') }}</span>
        </a>
        <a v-else class="statistic-right-attention" @click="_addAttention">
          <i class="iconfont icon-guanzhushu" />{{ $t('follow') }}
        </a>
        <a class="statistic-right-share">
          {{ $t('share') }}
        <Share :statistics="statistics" :address="address" :chain="chain" />
        </a>
      </div>
      <div>
        <div class="statistic-pnl" />
        <AveEmpty v-if="pnl.dataset.source.length <= 0" style="height: 80px" :showText="false" />
        <AveCharts
          v-else
          ref="profit"
          :containerStyle="{
            height: '80px',
            minWidth: '280px',
          }"
          :xAxis="pnl.xAxis"
          :series="pnl.series"
          :dataset="pnl.dataset"
          :tooltip="pnl.tooltip"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//组件
import AveCharts from '@/components/charts/aveCharts.vue'
import dayjs from 'dayjs'
import { getBalanceAnalysis, getWalletBasicInfo, bindTwitter } from '@/api/wallet'

import UserRemark from '@/components/userRemark.vue'
import UserAvatar from '@/components/userAvatar.vue'
import Share from '@/components/share.vue'
import AveEmpty from '@/components/aveEmpty.vue'

import ChainToken from '@/components/chainToken.vue'
import Number from '../components/Number.vue'
import { verifyLogin, formatRemark } from '@/utils'
import { formatNumber2, formatNumberS } from '@/utils/formatNumber'
import {addAttention, deleteAttention} from "~/api/attention";

const props = defineProps({
  chain: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  interval: {
    type: String,
    default: '',
  },
  isSelfAddress: Boolean,
  intervalText: {
    type: String,
    default: '',
  },
})

const $t = getGlobalT()

const { address, chain, interval, intervalText } = toRefs(props)
const botStore = useBotStore()
const themeStore = useThemeStore()

const { userInfo } = storeToRefs(useBotStore())

interface Statistics {
  wallet_logo?: any
  remark?: string
  x_name?: string
  x_url?: string
  x_followers?: number
  is_wallet_address_fav?: number
  total_profit_ratio?: number
  total_profit?: number | string
  total_win_rate?: number | string
  win_rate?: number
  profit?: number
  profit_ratio?: number
  wallet_age?: number | string
  [key: string]: any
}

const statistics = ref<Statistics>({ wallet_logo: {} })

const remark = ref({
  value: '',
  isEdit: false,
  loading: false,
})

const currentAccount = ''
const balanceAnalysis = ref({ profit: [], total_balance_without_risk: undefined })
const currencyStandard = ref('U')
//   ...mapState([
//     "token_user",
//     "currentAccount",
//     "mode",
//     "globalConfig",
//     "bot",
//   ]),
//   ...mapGetters(["language"]),

const pnl = computed(() => {
  const { profit = [] } = balanceAnalysis.value
  const xData = []
  profit.forEach((el) => {
    xData.push(el.time)
    el.negative = el.value < 0
    el.absValue = Math.abs(el.value)
  })
  console.log('pnl', xData)
  return {
    xAxis: {
      data: xData,
    },
    dataset: {
      source: profit,
      dimensions: ['time', 'absValue'],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        z: 0, // 层级（权重）
        lineStyle: {
          type: 'solid', // 将虚线改为实线
          width: 10, // 设置背景的宽度
          color: 'rgb(179, 179, 179,0.3)',
        },
      },
      padding: 8,
      backgroundColor: isDark.value ? 'rgba(0,0,0,.8)' : '#fff',
      borderWidth: 0,
      formatter: (params: { data: any }[]) => {
        const tooltipData =
          (params[0].data as {
            value: number
            absValue: number
            time: string
            negative?: boolean
          }) || {}
        let color,
          sign = ''
        if (tooltipData.value > 0) {
          color = '#12B886'
          sign = '+'
        } else if (tooltipData.value < 0) {
          color = '#F6465D'
          sign = '-'
        }
        return `<div style="font-size: 12px;">
             <div>
                 <span style="color:${color}">${sign}${uSymbol.value}${formatNumberS(
                   tooltipData?.absValue / main_token_price.value
                 )}${main_token_symbol.value}</span>
             </div>
             <div>
                  ${dayjs(tooltipData.time).format('MM/DD')}
             </div>
         </div>`
      },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 10,
        barMinHeight: 2,
        itemStyle: {
          color: (params) => {
            if (Math.abs(params.value?.value) > 0) {
              return params.value?.negative ? '#F6465D' : '#12B886'
            }
            return isDark.value ? '#999' : '#E5E5E5'
          },
        },
      },
    ],
  }
})

const defaultRemark = computed(() => {
  // const result =
  //   (userInfo?.address === address ? token_user?.remark : statistics?.remark) || statistics.x_name

  return statistics.value.remark //result
})

const isDark = computed(() => {
  return themeStore.isDark
})

const addressText = computed(() => {
  return address.value.slice(0, 4) + '...' + address.value.slice(-4)
})

const selfAddress = computed(() => {
  return botStore?.evmAddress || currentAccount
})

const wallet_age = computed(() => {
  const $t = getGlobalT()
  const wallet_age = statistics.value.wallet_age
  return ['--', '0'].includes(wallet_age)
    ? { value: '--' }
    : getDuring(wallet_age ? wallet_age * 1000 : undefined, $t)
})

const total_balance = computed(() => {
  const formatMap: Record<string, number> = {
    solana: 2,
    bsc: 4,
  }
  const { total_balance_without_risk } = balanceAnalysis.value
  return formatNumber((total_balance_without_risk ?? 0) / main_token_price.value, formatMap[chain.value])
})

const isUSDT = computed(() => {
  return currencyStandard.value == 'U'
})

const main_token_price = computed(() => {
  return isUSDT.value ? 1 : balanceAnalysis.value.main_token_price
})

const uSymbol = computed(() => {
  return isUSDT.value ? '$' : ''
})

const main_token_symbol = computed(() => {
  return isUSDT.value ? '' : balanceAnalysis.value.main_token_symbol
})

const chainAddress = computed(() => {
  return [chain.value, address.value]
})

watch(
  () => props.interval,
  (newVal: any) => {
    if (newVal) {
      onGetBalanceAnalysis()
    }
  },
  { immediate: true } // Remove if causing loops
)

watch(
  () => props.address,
  (newVal: any) => {
    if (newVal) {
      onGetWalletBasicInfo()
      onGetBalanceAnalysis()
    }
  },
  { immediate: true } // Remove if causing loops
)

onMounted(() => {
  onGetWalletBasicInfo()
  onGetBalanceAnalysis()
})

async function onGetWalletBasicInfo() {
  const params = {
    user_address: address.value,
    self_address: selfAddress.value,
    user_chain: chain.value,
  }
  const res = await getWalletBasicInfo(params)
  console.log(res, 'res=>')
  statistics.value = {
    ...statistics.value,
    ...(res || {}),
  }
  // if (address === botStore?.evmAddress) {
  remark.value = res.remark || userInfo?.name
  // }
}

function _deleteAttention() {
  if (!verifyLogin()) {
    return
  }
  deleteAttention({
    user_chain: chain.value,
    user_address: address.value,
    address: botStore.getWalletAddress(chain.value)!
  })
    .then(() => {
      ElMessage.success($t('attention1Canceled'))
      statistics.value.is_wallet_address_fav = 0
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}

async function _addAttention() {
  if (!verifyLogin()) {
    return
  }
  addAttention({
    user_chain: chain.value,
    user_address: address.value,
    address: botStore.getWalletAddress(chain.value)!
  })
    .then(() => {
      ElMessage.success($t('attention1Success'))
      statistics.value.is_wallet_address_fav = 1
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}
async function onGetBalanceAnalysis() {
  const params = {
    user_address: address.value,
    user_chain: chain.value,
    interval: interval.value,
  }
  const res = await getBalanceAnalysis(params)
  balanceAnalysis.value = res
}

async function _bindTwitter() {
  if (!verifyLogin()) {
    return
  }
  // let signature = ''
  // if (address.value && !botStore.evmAddress) {
  //   signature = await signTwitterConfirm()
  // }
  const data = {
    user_address: address.value,
    user_chain: chain.value,
    origin: window.location.href,
  }
  if (botStore.accessToken) {
    data.authorization = botStore.accessToken
  }
  // if (signature) {
  //   data.signature = signature
  // }
  // loadingBind = true
  bindTwitter(data)
    .then((res) => {
      const ave_param = res?.ave_param
      const host = 'https://api.agacve.com'
      const redirect_uri = encodeURIComponent(
        `${host}/v2api/walletinfo/v2/bind_x_callback?user_chain=${data.user_chain}&ave_param=${ave_param}&user_address=${data.user_address}`
      )

      const url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=UTdHQm9Ta2twLWtlWFBEd1hpenA6MTpjaQ&scope=tweet.read users.read follows.read list.read like.read&state=random_state&code_challenge=challenge&code_challenge_method=plain&redirect_uri=${redirect_uri}`
      window.open(url)
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      // loadingBind = false
    })
}

function getDuring(time, $t) {
  if (!time) return { value: '--', unit: '' } // Prevent infinite l
  const minutes = Math.abs(dayjs().diff(time, 'minute', true))
  // 单位换算表
  const thresholds = [
    { unit: $t('min2'), limit: 60, value: minutes },
    { unit: $t('hours'), limit: 60, value: minutes / 60 },
    { unit: $t('days2'), limit: Infinity, value: minutes / (60 * 24) },
  ]
  const { value, unit } = thresholds.find((t) => t.value < t.limit) || {}
  return { value: parseInt(value), unit }
}

function mergeStatistics(data) {
  const d = {
    ...statistics.value,
    ...data,
  }
  statistics.value = d
}
defineExpose({
  mergeStatistics,
})
</script>

<style scoped lang="scss">
.statistic {
  display: flex;
  justify-content: space-between;
  margin-right: 20px;
  flex: 1;
  border-radius: 8px;
  background-color: #15171c;

  .statistic-avatar {
    margin-bottom: 20px;
    display: flex;
    gap: 24px;

    .avatar-img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }

    .statistic-name {
      gap: 6px;
      font-size: 24px;
      line-height: 30px;
      color: var(--a-text-5-color);
    }
  }

  .statistic-edit {
    margin-bottom: 6px;
    width: fit-content;

    button {
      position: absolute;
      right: 5px;
      top: 5px;
      font-size: 12px;
      padding: 2px 5px;
    }

    ::v-deep(.el-input__wrapper) {
      background: var(--a-bg-7-color);
      box-shadow: none;

      &.height_36 {
        padding: 3px 11px;
      }

      .el-input__inner {
        color: var(--a-text-1-color);
      }
    }
  }

  .statistic-media {
    display: flex;
    align-items: center;
    gap: 8px;

    .statistic-media-left {
      padding: 0 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      height: 24px;
      border-radius: 4px;
      font-size: 12px;
      color: var(--d-666-l-959A9F);
      background-color: #222;
      .iconfont {
        font-size: 12px;
      }
    }
  }
  .statistic-media-right {
    margin-left: 24px;
    gap: 4px;
    padding: 4px 8px;
    height: 24px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    color: var(--d-fff-l-18181B);
    background: linear-gradient(
      90.25deg,
      rgba(18, 184, 134, 0.1) 0.27%,
      rgba(139, 79, 221, 0.1) 89.4%
    );
    > a {
      &:hover {
        color: inherit;
      }
    }
  }

  .statistic-address {
    display: flex;
    gap: 10px;
    cursor: pointer;

    .statistic-address-copy {
      padding: 7px 8px;
      height: 24px;
      border-radius: 4px;
      gap: 4px;
      font-size: 12px;
      color: var(--d-999-l-18181B);
      background-color: #222;

      > i {
        font-size: 10px;
        color: var(--d-999-l-333);
      }
    }

    .statistic-tag {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: var(--d-222-l-F4F4F5);
    }
  }

  .statistic-money {
    margin-bottom: 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 24px;
    line-height: 30px;
    font-weight: bold;

    .statistic-money-sum {
      font-size: 24px;
      line-height: 30px;
      color: var(--d-fff-l-333);
    }

    .statistic-money-profit {
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: var(--color-teal-300);

      &-negative {
        color: var(--color-red-500);
      }
    }

    ::v-deep(.el-switch) {
      --el-switch-off-color: #333;
      --el-switch-on-color: #666;
    }

    .statistic-money-u {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      border-radius: 50%;
      color: var(--d-fff-l-333);
      background-color: var(--d-666-l-fff);
    }
  }

  .statistic-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;

    .statistic-operations {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
      height: 60px;
      align-items: center;
      gap: 8px;
    }

    .statistic-right-share,
    .statistic-right-trade,
    .statistic-right-attention {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 11px 18px;
      background: var(--custom-br-1-color);
      color: var(--d-fff-l-333);
      font-size: 12px;
      line-height: 16px;
      cursor: pointer;
      border-radius: 4px;

      &:before {
        font-size: 16px;
      }
    }

    .statistic-right-attention {
      width: 100px;
      padding-left: 0;
      padding-right: 0;
      box-sizing: border-box;

      &-followed {
        color: var(--d-666-l-999);
        background: var(--d-0A0B0C-l-E5E5E5);

        .statistic-right-attention-cancel {
          display: none;
        }

        &:hover {
          opacity: 1;
          border-color: #f6465d;
          background-color: rgba(246, 70, 93, 0.1);

          > i,
          .statistic-right-attention-text {
            display: none;
          }

          .statistic-right-attention-cancel {
            color: #f6465d;
            display: inline;
          }
        }
      }
    }

    .statistic-right-trade {
      color: var(--d-333-l-fff);
      background: var(--d-fff-l-3F80F7);
    }

    .statistic-pnl {
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 32px;
      text-align: right;

      > span {
        color: var(--d-999-l-959A9F);
      }
    }

    .statistic-profit {
      font-size: 12px;
      line-height: 15px;
    }
  }

  .total-profit {
    margin: 0 0 8px;
    line-height: 20px;
    font-size: 14px;
    color: var(--d-666-l-959A9F);
    > span {
      margin-left: 8px;
    }
  }
}

.dialog-wallet {
  &.el-dialog .el-dialog__title {
    color: #fff;
  }

  &.dialog-share .content {
    .share-card {
      width: 558px;
    }
  }
}
</style>

function defineExpose(arg0: { mergeStatistics: (data: any) => void }) {
  throw new Error('Function not implemented.')
}

function defineExpose(arg0: { mergeStatistics: (data: any) => void }) {
  throw new Error('Function not implemented.')
}
