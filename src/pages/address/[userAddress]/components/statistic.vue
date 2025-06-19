<template>
  <div class="statistic p-20">
    <div>
      <div class="statistic-avatar">
        <UserAvatar
          :wallet_logo="{
            ...(statistics.wallet_logo || {}),
            ...(address === bot.userInfo?.evmAddress ? { name: bot.userInfo?.name } : {}),
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
              @updateRemark="getWalletBasicInfo"
            />
            <a
              v-if="statistics.x_url"
              class="statistic-media-right flex-center"
              :href="statistics.x_url"
              target="_blank"
            >
              <img
                width="16"
                :src="
                  isDark
                    ? require('@/assets/images/connect-x-dark.png')
                    : require('@/assets/images/connect-x-light.png')
                "
                alt=""
              />
              {{ $f.formatNumber2(statistics.x_followers, 2, 4, 4) }}
            </a>
            <a
              v-else-if="isSelfAddress"
              class="statistic-media-right flex-center pointer"
              @click="bindTwitter"
            >
              <i class="iconfont icon-twitter2" />
              {{ $t('connect') }}
            </a>
          </div>
          <div class="statistic-media">
            <div class="statistic-address" v-copy="address">
              <div class="statistic-address-copy flex-center">
                {{ addressText }}
                <i class="iconfont icon-copy" />
              </div>
            </div>
            <div class="statistic-media-left">
              <i class="iconfont icon-time" />
              <span>{{ wallet_age.value }}</span>
              <span>{{ wallet_age.unit }}</span>
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
        {{ $t('totalPnL2') }}（{{ intervalText }}）
        <Number :value="statistics.profit" :signVisible="isUSDT">
          {{ $f.formatNumber2(Math.abs(statistics.profit / main_token_price), 2, 4, 4) }}
          {{ main_token_symbol }}
        </Number>
        <Number :value="statistics.profit_ratio"
          >{{ $f.formatNumberS(Math.abs(statistics.profit_ratio * 100), 2) }}%
        </Number>
      </p>
      <p class="total-profit">
        {{ $t('winRate2') }}（{{ intervalText }}）<Number :value="statistics.win_rate"
          >{{ $f.formatNumberS(Math.abs(statistics.win_rate)) }}%</Number
        >
      </p>
    </div>
    <div class="statistic-right">
      <div class="statistic-operations">
        <a
          v-if="statistics.is_wallet_address_fav === 1"
          class="statistic-right-attention statistic-right-attention-followed"
          @click="deleteAttention"
        >
          <i class="iconfont icon-yiguanzhu" />
          <span class="statistic-right-attention-text">{{ $t('followed') }}</span>
          <span class="statistic-right-attention-cancel">{{ $t('cancelFollowed') }}</span>
        </a>
        <a v-else class="statistic-right-attention" @click="addAttention">
          <i class="iconfont icon-guanzhushu" />{{ $t('follow') }}
        </a>
        <a class="statistic-right-share" @click="openShareDialog">
          <i class="iconfont icon-fenxiangtubiao" />{{ $t('share') }}
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
    <el-dialog
      v-model="share.dialogVisible"
      class="dialog-share dialog-wallet"
      :title="$t('share')"
      width="628"
      append-to-body
    >
      <div class="content">
        <div class="share-card" style="background: #111; width: 558px">
          <img class="share-bg-img" :src="share.bgImg" alt="share" />
          <div style="display: inline-block">
            <div class="flex" style="flex-direction: column">
              <div class="flex-start">
                <img
                  src="@/assets/images/avedex_mobile_logo.png"
                  style="height: 24px"
                  height="24"
                  alt=""
                  srcset=""
                />
                <span class="ml-5 text-20px">Ave.ai</span>
              </div>
              <span
                class="mt_5 block"
                style="
                  margin-left: auto;
                  font-size: 10px;
                  color: #fff;
                  max-width: 180px;
                  text-align: center;
                "
                >{{ $t('campaignTitle') }}</span
              >
            </div>
          </div>
          <div class="flex-start mt-40">
            <div class="icon-token-container share">
              <img
                v-if="address === bot.userInfo?.evmAddress"
                class="avatar"
                :src="$f.generateAvatarIcon(bot.userInfo?.name || '')"
                alt=""
                width="80px"
                height="80px"
                onerror=" src='/icon-default.png'"
              />
              <img
                v-else
                class="avatar"
                :src="$f.generateAvatarIcon(address || '')"
                alt=""
                width="40px"
                height="40px"
                onerror=" src='/icon-default.png'"
              />
            </div>
            <span style="font-size: 14px; color: #999">
              {{ address?.slice(0, 4) + '...' + address?.slice(-4) }}
            </span>
          </div>
          <div class="mt-30" style="font-size: 40px">
            <span
              v-if="statistics?.total_profit_ratio > 0 || statistics?.total_profit_ratio < 0"
              :style="{
                color:
                  statistics?.total_profit_ratio > 0
                    ? $store.getters.upColor[7]
                    : $store.getters.downColor[7],
              }"
            >
              {{ statistics?.total_profit_ratio > 0 ? '+' : ''
              }}{{ $f.formatNumberS(statistics?.total_profit_ratio * 100 || 0, 2) }}%
            </span>
            <span v-else-if="statistics?.total_profit_ratio === 0" class="color-999">0</span>
            <span v-else class="color-999">--</span>
          </div>
          <table class="mt-30 share-table">
            <tbody>
              <tr>
                <td
                  :style="{
                    width: $f.getTextWidth($t('total_profit')) + 20 + 'px',
                  }"
                >
                  {{ $t('total_profit') }}
                </td>
                <td
                  :style="{
                    color:
                      statistics?.total_profit > 0
                        ? $store.getters.upColor[7]
                        : $store.getters.downColor[7],
                  }"
                >
                  <span
                    v-if="statistics?.total_profit > 0 > 0"
                    :style="{ color: $store.getters.upColor[7] }"
                  >
                    ${{ $f.formatNumber2(statistics?.total_profit || 0, 2, 4, 4) }}
                  </span>
                  <span v-else-if="statistics?.total_profit == 0">0</span>
                  <span v-else-if="statistics?.total_profit == '--'">--</span>
                  <span :style="{ color: $store.getters.downColor[7] }" v-else>
                    {{ '-$' + $f.formatNumber2(Math.abs(statistics?.total_profit) || 0, 2, 4, 4) }}
                  </span>
                </td>
              </tr>
              <tr>
                <td :style="{ width: $f.getTextWidth($t('winRate')) + 20 + 'px' }">
                  {{ $t('winRate') }}
                </td>
                <td>
                  <span
                    v-if="statistics?.total_win_rate > 0"
                    :style="{ color: $store.getters.upColor[7] }"
                  >
                    {{ $f.formatNumber2(statistics?.total_win_rate || 0, 2) + '%' }}
                  </span>
                  <span v-else-if="statistics?.total_win_rate === 0">0</span>
                  <span v-else-if="statistics?.total_win_rate === '--'">--</span>
                  <span v-else :style="{ color: $store.getters.downColor[7] }">
                    {{ $f.formatNumber2(statistics?.total_win_rate || 0, 2) + '%' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="invite">
            <div class="tr mt_10">
              <span class="font-20 font_weight_700 block">{{ $t('campaignSubTitle') }}</span>
              <span class="font-12 font_weight_400 mt_10">{{ $t('campaignDesc') }}</span>
            </div>
            <div class="ml_10">
              <img :src="share.qrcodeUrl" :alt="$t('campaignScan')" width="60px" height="60px" />
              <span class="font-14 font_weight_400 mt_5 block">{{ $t('campaignScan') }}</span>
            </div>
          </div>
        </div>
        <div class="flex mt-20 text-12px" style="width: 300px; color: #999">
          <div class="flex-col flex-center clickable" @click.stop="downloadSharePoster">
            <img src="@/assets/images/share/download.svg" height="48" alt="" srcset="" />
            <span class="mt-8">{{ $t('download') }}</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpX()">
            <img src="@/assets/images/share/twitter.svg" height="48" alt="" srcset="" />
            <span class="mt-8">Twitter</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpTg()">
            <img src="@/assets/images/share/tg.svg" height="48" alt="" srcset="" />
            <span class="mt-8">Telegram</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
//组件
import AveCharts from '@/components/charts/aveCharts.vue'

// 工具、方法
import * as echarts from 'echarts'
import { mapGetters, mapState } from 'vuex'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import numeral from 'numeral'
import dayjs from 'dayjs'
import { getBalanceAnalysis, getWalletBasicInfo, updateWhaleRemark } from '@/api'
import { bindTwitter } from '@/api/twitter'
import { download } from '@/utils/download'
import { isNumericString } from '@/utils/utils'
import UserRemark from '@/components/userRemark.vue'
import UserAvatar from '@/components/userAvatar.vue'

// 资源
import up1 from '@/assets/images/share/up_1.webp'
import down1 from '@/assets/images/share/down_1.webp'
import ChainToken from '@/components/chainToken.vue'
import AveEmpty from '@/components/aveEmpty.vue'
import Number from '@/views/wallet/walletDetail/components/Number.vue'

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
  intervalText: String,
})

const { address, interval } = toRefs(props)

const statistics: {}
const remark = {
  value: '',
  isEdit: false,
  loading: false,
}
const share = {
  qrcodeUrl: '',
  bgImg: '',
  canvas: null,
  dialogVisible: false,
}
const balanceAnalysis = {}
const currencyStandard = 'U'

//   ...mapState([
//     "token_user",
//     "currentAccount",
//     "mode",
//     "globalConfig",
//     "bot",
//   ]),
//   ...mapGetters(["language"]),

const pnl = computed(() => {
  const { profit = [] } = balanceAnalysis
  const xData = []
  profit.forEach((el) => {
    xData.push(el.time)
    el.negative = el.value < 0
    el.absValue = Math.abs(el.value)
  })
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
      backgroundColor: isDark ? 'rgba(0,0,0,.8)' : '#fff',
      borderWidth: 0,
      formatter: (params) => {
        const tooltipData = params[0].data || {}
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
                 <span style="color:${color}">${sign}${uSymbol}${$f.formatNumberS(
                   tooltipData?.absValue / main_token_price
                 )}${main_token_symbol}</span>
             </div>
             <div>
                  ${$dayjs(tooltipData.time).format('MM/DD')}
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
            return isDark ? '#999' : '#E5E5E5'
          },
        },
      },
    ],
  }
})

const defaultRemark = computed(() => {
  const result =
    (token_user?.address === address ? token_user?.remark : statistics?.remark) || statistics.x_name

  return result
})

const shortedAddress = computed(() => {
  return address.replace(new RegExp('(.+)(.{5}$)'), '*$2')
})

const isDark = computed(() => {
  return mode === 'dark'
})

const addressText = computed(() => {
  return address.slice(0, 4) + '...' + address.slice(-4)
})

const selfAddress = computed(() => {
  return bot.userInfo?.evmAddress || currentAccount
})

const upImg = computed(() => {
  let shareImg = globalConfig?.pc_share_image?.replace(/^.*\|/, '')
  return shareImg.split(',').map((img) => {
    return globalConfig?.token_logo_url + 'pc_share/' + img
  })
})

const downImg = computed(() => {
  let shareImg = globalConfig?.pc_share_image?.replace(/\|.*$/, '')
  return shareImg?.split(',')?.map?.((img) => {
    return globalConfig?.token_logo_url + 'pc_share/' + img
  })
})

const wallet_age = computed(() => {
  const wallet_age = statistics.wallet_age
  return ['--', '0'].includes(wallet_age)
    ? { value: '--' }
    : getDuring(wallet_age ? wallet_age * 1000 : undefined, $t)
})

const total_balance = computed(() => {
  const formatMap = {
    solana: '0,0.00',
    bsc: '0,0.0000',
  }
  let { total_balance_without_risk } = balanceAnalysis
  return numeral(total_balance_without_risk / main_token_price).format(formatMap[chain])
})

const isUSDT = computed(() => {
  return currencyStandard === 'U'
})

const main_token_price = computed(() => {
  return isUSDT ? 1 : balanceAnalysis.main_token_price
})

const uSymbol = computed(() => {
  return isUSDT ? '$' : ''
})

const main_token_symbol = computed(() => {
  return isUSDT ? '' : balanceAnalysis.main_token_symbol
})

const chainAddress = computed(() => {
  return [chain, address]
})

watch(interval, () => {
  getBalanceAnalysis()
})

watch(address, () => {
  getWalletBasicInfo()
  getBalanceAnalysis()
})

onMounted(() => {
  getWalletBasicInfo()
  getBalanceAnalysis()
})
function toggleEdit() {
  if (!$f.verifyLogin()) {
    return
  }
  remark.isEdit = true
}
function updateWhaleRemark() {
  if (!$f.verifyLogin()) {
    return
  }
  if (!remark.value) {
    remark.isEdit = false
    return
  }
  if (remark.value.length > 50) {
    return ElMessage.error($t('maximum10characters'))
  }
  const params = {
    user_address: address,
    self_address: selfAddress,
    remark: remark.value,
    user_chain: chain,
  }
  remark.loading = true
  updateWhaleRemark(params)
    .then(() => {
      ElMessage.success($t('success'))
      getWalletBasicInfo()
    })
    .catch((err) => {
      ElMessage.error($t('fail'))
      console.log(err)
    })
    .finally(() => {
      remark.loading = false
      remark.isEdit = false
    })
}
function getWalletBasicInfo() {
  const params = {
    user_address: address,
    self_address: selfAddress,
    user_chain: chain,
  }
  getWalletBasicInfo(params).then((res) => {
    statistics = {
      ...statistics,
      ...(res || {}),
    }
    if (address === bot.userInfo?.evmAddress) {
      remark.value = res.remark || bot.userInfo?.name
    }
  })
}

function deleteAttention() {
  if (currentAccount === '' && !bot.userInfo?.evmAddress) {
    $store.commit('changeConnectVisible', true)
    return
  }
  $store
    .dispatch('deleteAttention', {
      address: address,
      chain: chain,
    })
    .then(() => {
      ElMessage.success($t('attention1Canceled'))
      statistics.is_wallet_address_fav = 0
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}
async function addAttention() {
  if (currentAccount === '' && !bot.userInfo?.evmAddress) {
    $store.commit('changeConnectVisible', true)
    return
  }
  const res = await $f.signConfirm()
  if (!res) {
    return
  }
  $store
    .dispatch('addAttention', { address: address, chain: chain })
    .then(() => {
      ElMessage.success($t('attention1Success'))
      statistics.is_wallet_address_fav = 1
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}
function openShareDialog() {
  share.dialogVisible = true
  getQRCode()
  getRandomBg(statistics?.total_profit_ratio > 0)
  setTimeout(() => {
    getShareImg()
  }, 100)
}
// 随机获取背景图片
function getRandomBg(isUp = false) {
  const imgs = isUp ? upImg : downImg
  const len = imgs.length
  const index = getRandom(1, len)
  share.bgImg = imgs?.[index] || (isUp ? up1 : down1)
}

function getQRCode() {
  const inviterUrl = globalConfig.inviter_url_v2 || 'https://share.ave.ai'
  const refCode = bot.referralInfo.refCode
  const shareLink = inviterUrl + '?code=' + refCode + '&lang=' + language
  QRCode.toDataURL(shareLink, { margin: 1 })
    .then((url) => {
      share.qrcodeUrl = url
    })
    .catch((err) => {
      console.error(err)
    })
}

function getShareImg() {
  let postersDom = document.querySelector('.share-card')
  if (postersDom) {
    return html2canvas(postersDom, {
      backgroundColor: null,
      scale: 3,
      allowTaint: true,
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
      height: postersDom.clientHeight - 1,
    }).then((canvas) => {
      share.canvas = canvas
      return canvas
    })
  }
}
function downloadSharePoster() {
  let postersDom = document.querySelector('.share-card')
  if (postersDom) {
    html2canvas(postersDom, {
      backgroundColor: null,
      scale: 3,
      allowTaint: true,
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
    }).then((canvas) => {
      let dataURL = canvas.toDataURL('image/png')
      download(dataURL, `ave-${Date.now()}.png`)
    })
  }
}
function getBalanceAnalysis() {
  const { address, chain, interval } = this
  const params = {
    user_address: address,
    user_chain: chain,
    interval,
  }
  getBalanceAnalysis(params)
    .then((res) => {
      balanceAnalysis = res
      // setTimeout(() => {
      //   if ( balanceAnalysis.profit?.length > 0) {
      //      initEvent()
      //   }
      // }, 20)
    })
    .catch(console.log)
}

async function bindTwitter() {
  $f.verifyLogin()
  let signature = ''
  if (address) {
    signature = await $f.signTwitterConfirm()
  }
  let data = {
    user_address: address,
    user_chain: chain,
    signature: signature,
    origin: window.location.href,
  }
  if ($store.state.bot.accessToken) {
    data.authorization = bot.accessToken
  }
  if (signature) {
    data.signature = signature
  }
  loadingBind = true
  bindTwitter(data)
    .then((res) => {
      console.log('----ave_param-------', res)
      let ave_param = res?.ave_param
      const host =
        process.env.VUE_APP_BASE_API === 'https://0ftrfsdb.xyz'
          ? 'https://0ftrfsdb.xyz'
          : 'https://api.agacve.com'
      let redirect_uri = encodeURIComponent(
        `${host}/v2api/walletinfo/v2/bind_x_callback?user_chain=${data.user_chain}&ave_param=${ave_param}&user_address=${data.user_address}`
      )

      let url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=UTdHQm9Ta2twLWtlWFBEd1hpenA6MTpjaQ&scope=tweet.read users.read follows.read list.read like.read&state=random_state&code_challenge=challenge&code_challenge_method=plain&redirect_uri=${redirect_uri}`
      window.open(url)
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loadingBind = false
    })
}

// 获取1-5的随机值
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getDuring(time, $t) {
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
</script>
