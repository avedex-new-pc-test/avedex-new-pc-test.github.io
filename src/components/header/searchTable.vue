<template>
  <div class="histrory">
    <div class="top">
      <span>#</span>
      <span>{{ $t('tokenName') }}</span>
      <span>{{ $t('launchTime') }}</span>
      <span>{{ $t('price') }}</span>
      <span>{{ $t('24Volume') }}</span>
      <span>{{ $t('pool') }}</span>
      <span>{{ $t('holders') }}</span>
      <span>{{ $t('Txs') }}</span>
      <span>{{ $t('riskScore') }}</span>
    </div>
    <el-scrollbar
      v-if="tokens1?.length > 0 || isLoading"
      v-loading="isLoading"
      height="500px"
      max-height="calc(100vh - 200px)"
    >
      <ul class="content">
        <li v-for="(row, $index) in tokens1" :key="$index">
          <a
            href=""
            class="flex no-underline"
            @click.stop.prevent="tableRowClick(row.id)"
          >
            <div class="color-#999 text-12px">
              {{ $index < 9 ? '0' + Number($index + 1) : $index + 1 }}
            </div>
            <div class="token-info">
              <div
                v-if="getSymbolDefaultIcon(row)"
                class="icon-token-container relative"
              >
                <el-image
                  class="token-icon"
                  :src="getSymbolDefaultIcon(row)"
                  lazy
                >
                  <template #error>
                    <img
                      class="token-icon"
                      :src="getChainDefaultIcon(row.chain, row.symbol)"
                    >
                  </template>
                  <template #placeholder>
                    <img
                      class="token-icon"
                      :src="getChainDefaultIcon(row.chain, row.symbol)"
                    >
                  </template>
                </el-image>
                <img
                  v-if="row?.chain"
                  class="icon-svg icon-symbol"
                  :src="`${token_logo_url}chain/${row?.chain}.png`"
                  alt=""
                  srcset=""
                >
              </div>
              <div style="margin-left: 5px">
                <div>
                  <span class="token-symbol">
                    {{ row.symbol }}
                    <!-- <span style="color: rgb(132, 142, 156)">({{ row.token?.slice(0,4) + '*' + row.token?.slice(-4) }})</span> -->
                  </span>
                  <div
                    v-if="row?.is_adv === 1 && row?.is_showasadv === 1"
                    class="ad-tag"
                  >
                    AD
                  </div>
                  <span
                    v-if="row.risk_level < 0 || row?.risk_score > 55"
                    class="risk-status high"
                  >
                    {{ $t('highRisk') }}
                  </span>
                  <template v-if="row?.hot_rank">
                    <svg
                      v-for="(item, index) in row?.hot_rank"
                      :key="index"
                      class="icon-svg"
                      aria-hidden="true"
                      style="margin-left: 3px; width: 12px"
                    >
                      <use xlink:href="#icon-huoyan" />
                    </svg>
                  </template>
                </div>
                <div class="text-12px color-text-2">
                  {{ row.token?.slice(0, 4) + '*' + row.token?.slice(-4) }}
                </div>
              </div>
            </div>
            <div>
              {{ row.opening_at > 0 ? formatDate(row.opening_at) : '--' }}
            </div>
            <template v-if="row.current_price_usd > 0">
              <div>
                <span
                  :class="
                    row.current_price_usd > 0 ? 'color-[--d-F5F5F5-l-333]' : ''
                  "
                  >${{ formatNumber(row.current_price_usd || 0) }}</span
                >
                <div class="text-12px">
                  <span
                    v-if="row.price_change > 0"
                    style="color: #12b886; padding: 10px 0"
                  >
                    +{{ formatNumber(row.price_change || 0) }}%
                  </span>
                  <span
                    v-if="row.price_change == 0"
                    style="color: #848e9c; padding: 10px 0"
                  >
                    0%
                  </span>
                  <span
                    v-if="row.price_change < 0"
                    style="color: #ff646d; padding: 10px 0"
                  >
                    {{ formatNumber(row.price_change || 0) }}%
                  </span>
                </div>
              </div>
              <div
                :class="
                  row.tx_volume_u_24h > 0 ? 'color-[--d-F5F5F5-l-333]' : ''
                "
              >
                ${{ formatNumber(row?.tx_volume_u_24h || 0, 2) }}
              </div>
              <div :class="row.pool_size > 0 ? 'color-[--d-F5F5F5-l-333]' : ''">
                ${{ formatNumber(row?.pool_size || 0, 2) }}
              </div>
              <div>{{ formatNumber(row?.holders || 0) }}</div>
              <div class="text-12px color-text-2">
                {{ formatNumber(row?.tx_count_24h || 0) }}
              </div>
              <span>
                {{ formatNumber(row.risk_score) || 0 }}
              </span>
            </template>
            <div v-else>
              <!-- <count-down
                v-if="showTime"
                class="count-down mt-8"
                :time="time"
                format="DD:HH:mm:ss"

              >
                <template #default="timeData">
                  <span class="block">
                    {{
                      timeData.days < 10 ? '0' + timeData.days : timeData.days
                    }}
                  </span>
                  <span class="block ml-3">
                    {{
                      timeData.hours < 10
                        ? '0' + timeData.hours
                        : timeData.hours
                    }}
                  </span>
                  <span class="colon">:</span>
                  <span class="block">
                    {{
                      timeData.minutes < 10
                        ? '0' + timeData.minutes
                        : timeData.minutes
                    }}
                  </span>
                  <span class="colon">:</span>
                  <span class="block">
                    {{
                      timeData.seconds < 10
                        ? '0' + timeData.seconds
                        : timeData.seconds
                    }}
                  </span>
                </template>
              </count-down> -->

              <div v-if="row.opening_at > 0">
                <count-down />
              </div>

              <template v-else>
                <img src="@/assets/images/icon-unknown.png" alt="" >
                {{ $t('unknownRisk') }}
              </template>
            </div>
          </a>
        </li>
        <li
          v-for="(row, $index) in tokens2"
          v-show="isShowHighRisk"
          :key="$index"
        >
          <a
            href=""
            class="flex no-underline"
            @click.stop.prevent="tableRowClick(row.id)"
          >
            <div>
              {{
                tokens1?.length + $index < 9
                  ? '0' + Number(tokens1?.length + $index + 1)
                  : tokens1?.length + $index + 1
              }}
            </div>
            <div class="token-info">
              <div
                v-if="getSymbolDefaultIcon(row)"
                class="icon-token-container"
              >
                <el-image
                  class="token-icon"
                  :src="getSymbolDefaultIcon(row)"
                  lazy
                >
                  <template #error>
                    <img
                      class="token-icon"
                      :src="getChainDefaultIcon(row.chain, row.symbol)"
                    >
                  </template>
                  <template #placeholder>
                    <img
                      class="token-icon"
                      :src="getChainDefaultIcon(row.chain, row.symbol)"
                    >
                  </template>
                </el-image>
                <img
                  v-if="row?.network || row?.chain"
                  class="icon-svg icon-symbol"
                  :src="`${token_logo_url}chain/${
                    row?.network || row?.chain
                  }.png`"
                  alt=""
                  srcset=""
                >
              </div>
              <div style="margin-left: 5px">
                <div>
                  <span class="token-symbol">
                    {{ row.symbol }}
                  </span>
                  <div
                    v-if="row?.is_adv === 1 && row?.is_showasadv === 1"
                    class="ad-tag"
                  >
                    AD
                  </div>
                  <span
                    v-if="row.risk_level < 0 || row?.risk_score > 55"
                    class="risk-status high"
                  >
                    {{ $t('highRisk') }}
                  </span>
                  <template v-if="row?.hot_rank">
                    <svg
                      class="icon-svg"
                      aria-hidden="true"
                      style="margin-left: 3px; width: 12px"
                    >
                      <use xlink:href="#icon-huoyan" />
                    </svg>
                  </template>
                </div>
                <div class="text-12px color-text-2">
                  {{ row.token?.slice(0, 4) + '*' + row.token?.slice(-4) }}
                </div>
              </div>
            </div>
            <template v-if="row.current_price_usd > 0">
              <div>
                <div v-html="'$' + formatNumber(row.current_price_usd || 0)" />
                <div class="text-12px">
                  <span
                    v-if="row.current_price_usd > 0"
                    style="color: #12b886; padding: 10px 0"
                  />
                  <span
                    v-if="row.current_price_usd == 0"
                    style="color: #848e9c; padding: 10px 0"
                  >
                    0%
                  </span>
                </div>
              </div>
              <div>
                <div>${{ formatNumber(row?.tx_volume_u_24h || 0, 2) }}</div>
                <div class="text-12px color-text-2">
                  ${{ formatNumber(row?.pool_size || 0, 2) }}
                </div>
              </div>
              <div>
                <div>{{ formatNumber(row?.holders || 0) }}</div>
                <div class="text-12px color-text-2">
                  {{ formatNumber(row?.tx_count_24h || 0) }}
                </div>
              </div>
              {{ Number(row.risk_score) || 0 }}
            </template>
            <div v-else>
              <!-- <count-down
                v-if="showTime"
                class="count-down mt-8"
                :time="time"
                format="DD:HH:mm:ss"
                @finish="finishTime"
              >
                <template #default="timeData">
                  <span class="block">
                    {{
                      timeData.days < 10 ? '0' + timeData.days : timeData.days
                    }}
                  </span>
                  <span class="block ml-3">
                    {{
                      timeData.hours < 10
                        ? '0' + timeData.hours
                        : timeData.hours
                    }}
                  </span>
                  <span class="colon">:</span>
                  <span class="block">
                    {{
                      timeData.minutes < 10
                        ? '0' + timeData.minutes
                        : timeData.minutes
                    }}
                  </span>
                  <span class="colon">:</span>
                  <span class="block">
                    {{
                      timeData.seconds < 10
                        ? '0' + timeData.seconds
                        : timeData.seconds
                    }}
                  </span>
                </template>
              </count-down> -->
              <span v-if="row.opening_at > 0"> 倒计时 </span>
              <template v-else>
                <img src="@/assets/images/icon-unknown.png" alt="" >
                {{ $t('unknownRisk') }}
              </template>
            </div>
          </a>
        </li>
        <li
          v-show="tokens2?.length > 0"
          class="text-12px justify-center p-20px"
          style="display: flex; margin-top: 20px"
        >
          <div
            style="cursor: pointer"
            @click.stop="isShowHighRisk = !isShowHighRisk"
          >
            <Icon
              class="text-20px text-#F6465D"
              name="ri:error-warning-fill"
            />
            <span class="ml-5px mr-5px" style="color: #848e9c"
              >{{
                isShowHighRisk ? $t('hiddenHighToken') : $t('showHighToken')
              }}({{ tokens2?.length }})</span
            >
            <Icon
              v-if="!isShowHighRisk"
              class="text-20px text-#848e9c"
              name="solar:round-arrow-down-bold"
            />
            <Icon
              v-else
              class="text-20px text-#848e9c"
              name="solar:round-arrow-up-bold"
            />
          </div>
        </li>
      </ul>
    </el-scrollbar>
    <div v-if="!isLoading && !tokens?.length" class="empty">
      <div>
        <img :src="themeStore.theme === 'light' ? emptyWhite : emptyDark" >
        <br >
        <span>{{ $t('noSearchResults') }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import emptyWhite from '@/assets/images/empty-white.svg'
import emptyDark from '@/assets/images/empty-black.svg'
import { formatNumber } from '@/utils/formatNumber'
import {
  getSymbolDefaultIcon,
  getChainDefaultIcon,
  formatDate,
} from '@/utils/index'
import CountDown from './countDown.vue'
import type { SearchHot } from '@/api/types/search'
const themeStore = useThemeStore()
const props = defineProps({
  tokens: {
    type: Array<SearchHot>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])
const $router = useRouter()
const { token_logo_url } = useConfigStore()
const tokens1 = computed(() => {
  // const list = hotStore.hotList?.map(i => ({ ...i, current_price_usd: 0, opening_at: 1747466626 }))
  // console.log('------list--------',list)
  return (
    props.tokens?.filter?.((i) => !(i.risk_level < 0 || i.risk_score > 55)) || []
  )
})
const tokens2 = computed(() => {
  return (
    props.tokens?.filter?.((i) => i.risk_level < 0 || i.risk_score > 55) || []
  )
})
const isLoading = computed(() => {
  return props.loading
})
function tableRowClick(id: string) {
  $router.push({
    name: 'token-id',
    params: { id: id },
  })
  emit('close')
}
const isShowHighRisk = shallowRef(true)
</script>
<style lang="scss" scoped>
.histrory {
  font-size: 12px;
  padding-bottom: 10px;
  color: #999;
  .empty {
    color: #999;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      text-align: center;
    }
    img {
      width: 100px;
      margin-bottom: 20px;
    }
  }
  .top {
    color: var(--d-666-l-999);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 5px;
    > :nth-child(1) {
      width: 40px;
      font-size: 12px;
    }
    > :nth-child(2) {
      flex: 1.3;
    }
    > :nth-child(3) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(4) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(5) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(6) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(7) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(8) {
      flex: 1;
      text-align: right;
    }
    > :nth-child(9) {
      flex: 1;
      text-align: right;
    }
  }
  .content {
    padding: 0 0 20px;
    .token-info {
      display: flex;
      align-items: center;
      .token-symbol {
        // white-space: nowrap;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // max-width: 100px;
        display: inline-block;
        word-break: break-all;
        padding: 0;
        color: var(--d-F5F5F5-l-333);
        font-size: 12px;
      }
      .icon-collect {
        font-size: 16px;
        color: #787b86;
        cursor: pointer;
        margin-right: 2px;
        &.collected {
          color: #558bed;
        }
      }
      .token-network {
        border: 1px solid #878fbc;
        border-radius: 10px;
        font-size: 12px;
        color: #878fbc;
        padding: 2px 5px;
        margin-left: 9px;
      }
      .token-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      .icon-svg {
        width: 12px;
        position: absolute;
        bottom: 0px;
        right: 0px;
      }
      .ad-tag {
        border: 1px solid;
        padding: 0 4px;
        font-size: 12px;
        margin-left: 5px;
        color: #878fbc;
        border-radius: 5px;
      }
      .risk-status {
        display: inline-block;
        font-size: 10px;
        border: 1px solid;
        border-radius: 20px;
        padding: 1px 3px;
        margin-left: 5px;
        &.high {
          color: #f72121;
        }
      }
    }
    a:hover {
      text-decoration: none;
      background-color: var(--custom-bg-3-color);
      opacity: 1;
    }
    li:nth-child(1) .flex {
      margin-top: 0;
    }
    .flex {
      font-size: 12px;
      padding: 8px 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      > :nth-child(1) {
        width: 40px;
        font-size: 12px;
      }
      > :nth-child(2) {
        flex: 1.3;
      }
      > :nth-child(3) {
        flex: 1;
        text-align: right;
      }
      > :nth-child(4) {
        flex: 1;
        text-align: right;
      }
      > :nth-child(5) {
        flex: 1;
        text-align: right;
      }
      > :nth-child(6) {
        flex: 1;
        text-align: right;
        color: #eaecef;
      }
      > :nth-child(7) {
        flex: 1;
        text-align: right;
      }
      > :nth-child(8) {
        flex: 1;
        text-align: right;
      }
      > :nth-child(9) {
        flex: 1;
        text-align: right;
      }
    }
    span {
      padding: 10px 3px;
      &.green {
        color: #12b886;
      }
      &.red {
        color: #ff646d;
      }
    }
  }
  a {
    color: var(--custom-font-1-color);
  }
  .no-inherit {
    vertical-align: middle;
  }
  .count-down {
    text-align: right;
    .colon {
      display: inline-block;
      margin: 0 2px;
      color: #3f80f7;
      font-size: 12px;
      padding: 0;
    }
    .block {
      display: inline-block;
      font-size: 12px;
      // width: 30px;
      color: #3f80f7;
      // line-height: 30px;
      text-align: center;
      border-radius: 4px;
      background-color: #1f242a;
      padding: 1px 5px;
    }
  }
}
</style>
