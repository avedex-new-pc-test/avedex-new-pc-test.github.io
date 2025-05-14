<template>
  <table class="pairs-table">
    <thead>
      <tr>
        <th>{{ $t('liquidityPair') }}</th>
        <th>{{ $t('amount') }}/{{ $t('initial') }}</th>
        <th>{{ $t('price') }}/{{ $t('poolCirculatingSupply') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in ((show ? pairs : pairs?.slice?.(0, 1)) || [])"
        :key="index"
        @click.stop="goLink(item)"
        :class="{ active: $store.state.pair.address === item.pair }"
      >
        <td>
          <div class="main flex-start">
            <span>{{ item.target_token === item.token0_address ? item.token0_symbol : item.token1_symbol }}</span>
            <el-progress
              @click.stop.prevent="visible = true"
              class="progress clickable"
              type="circle"
              :percentage="percent"
              color="#12B886"
              :width="16"
              :stroke-width="1.5"
              indeterminate
              v-if="index === 0 && percent > 0"
            >
              <i class="iconfont icon-suo1"></i>
            </el-progress>
          </div>
          <a
            href
            class="main"
            @click.stop.prevent="
              $router.push({
                name: 'Token',
                params: { id: (item.target_token === item.token0_address ? item.token1_address : item.token0_address) + '-' + item.chain },
                query: { from: $route.name }
              })
            "
          >
            {{ item.target_token === item.token0_address ? item.token1_symbol : item.token0_symbol }}
          </a>
          <el-tooltip
            v-if="item.is_fake"
            effect="customized"
            :content="$t('phoneyPool')"
            placement="top"
            :popper-class="$store.state.mode"
          >
            <el-icon
              v-if="item.is_fake"
              class="ml-3 relative-top-2"
              size="12px"
              color="#ffbb19"
            >
              <Warning />
            </el-icon>
          </el-tooltip>
        </td>
        <td>
          <span class="main">{{ $f.formatNumber2((item.target_token === item.token0_address ? item.reserve0 : item.reserve1) || 0, 2, 4, 10 ** 4) }}</span>
            <span class="minor">/
              <template v-if="item.init_reserve0 || item.init_reserve1">
                {{ $f.formatNumber2((item.target_token === item.token0_address ? item.init_reserve0 : item.init_reserve1) || 0, 2, 4, 10 ** 4) }}
              </template>
              <template v-else>
                --
              </template>
            </span>
          <br />
          <!-- 冲土狗的时候，这个流动性sol是个最容易判断涨跌的指标，需要醒目一点 -->
          <span v-if="item.target_token === item.token0_address" :class="['main',new BigNumber(item.reserve1).gt(item.init_reserve1) ? 'green':'red']">{{ $f.formatNumber2(item.reserve1|| 0, 2, 4, 10 ** 4) }}</span>
          <span v-else class="main" :class="['main',new BigNumber(item.reserve0).gt(item.init_reserve0) ? 'green':'red']">{{ $f.formatNumber2(item.reserve0|| 0, 2, 4, 10 ** 4) }}</span>
          <span class="minor">/
            <template v-if="item.init_reserve0 || item.init_reserve1">
              {{ $f.formatNumber2((item.target_token === item.token0_address ? item.init_reserve1 : item.init_reserve0 )|| 0, 2, 4, 10 ** 4) }}
            </template>
            <template v-else>
              --
            </template>
          </span>
        </td>
        <td>
          <div class="flex-baseline">
            <div>
              <el-tooltip
                v-model:visible="showPopoverPool[index]"
                manual="true"
                effect="customized"
                :content="item.amm"
                placement="top"
                :popper-class="$store.state.mode"
              >
                <i
                  class="iconfont icon-unknown color-848E9C font-16 mr-5"
                  v-if="item.amm === 'unknown'"
                ></i>
                <a
                  v-else
                  :href="item.swap_url + item.target_token"
                  target="_blank"
                  @mouseenter="showPopoverPool[index] = true"
                  @mouseleave="showPopoverPool[index] = false"
                >
                  <img
                    class="icon-svg icon-symbol"
                    :src="$f.formatIconSwap(item.amm)"
                    onerror="this.src='/icon-default.png'"
                    height="20"
                  />
                </a>
              </el-tooltip>
              <span
                class="main"
                v-if="item.target_token === item.token0_address"
                v-html="'$' + $f.formatNumber3(item.token0_price_usd || 0, 2, 4, 10 ** 4 || 0)"
              ></span>
              <span
                class="main"
                v-else
                v-html="'$' + $f.formatNumber3(item.token1_price_usd || 0, 2, 4, 10 ** 4 || 0)"
              ></span>
              <br />
              <span class="main" v-if="item.target_token === item.token0_address">
                ${{
                  $f.formatNumber2(
                    item.reserve1 * item.token1_price_usd * 2 || 0,
                    2,
                    4,
                    10 ** 4
                  )
                }}
              </span>
              <span class="main" v-else>
                ${{
                  $f.formatNumber2(
                    item.reserve0 * item.token0_price_usd * 2 || 0,
                    2,
                    4,
                    10 ** 4
                  )
                }}
              </span>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="pairs.length > 1" class="collapse-button">
    <button @click.stop.prevent="show = !show">
      <!-- {{ !show ? $t('more') : $t('expand') }} -->
      <van-icon :class="show ? 'collapse' : 'expand'" name="arrow" />
    </button>
  </div>
  <el-dialog v-model="visible" width="600px" class="dialog">
    <template #header>
      <span class="dialog_title">LP {{ $t('holdersDetail') }}</span>
    </template>
    <CheckHolders class="holders" type="pair" :checkResult="LPHolders" :holders="$store.state.tokenInfo.pair_holders || 0" onlyList></CheckHolders>
  </el-dialog>
</template>
<script>
import { Icon } from 'vant'
import BigNumber from 'bignumber.js'

import CheckHolders from './check/holders.vue'

export default {
  name: 'Pairs',
  components: {
    'van-icon': Icon,
    CheckHolders
  },
  data() {
    return {
      show: false,
      visible: false,
      showPopoverPool: [],
      BigNumber:BigNumber
    }
  },
  computed: {
    pairs() {
      return this.$store.state.tokenInfo?.pairs || []
    },
    percent() {
      return this.$store.state.tokenInfo?.pair_lock_percent * 100 || 0
    },
    LPHolders() {
      return {
        chain: this.$store.state.tokenInfo.chain,
        pair_holders_rank: this.$store.state.LPHolders
      }
    },
  },
  watch: {
    pairs() {
      this.showPopoverPool = this.pairs.map(() => false)
    },
  },
  mounted() {
  },
  methods: {
    goLink (item) {
      this.$store.commit('setInitToken', item.pair)
    },
  }
}
</script>
<style lang="scss" scoped>
  .pairs-table {
    width: calc(100% + 30px);
    font-size: 12px;
    line-height: 1.5;
    border-spacing: 0 2px;
    margin-left: -15px;
    color: var(--custom-text-2-color);
    border-collapse: collapse;
    // box-shadow: 0 10px 10px #363d67;
    th {
      text-align: center;
      font-size: 12px;
      color: var(--custom-text-2-color);
      letter-spacing: 0;
      font-weight: 400;
    }
    td {
      text-align: center;
      padding: 5px 3px;
      word-break: break-word;
      vertical-align: top;
      &:nth-child(1) {
        padding: 5px 0;
      }
    }
    tr {
      cursor: pointer;
      td:first-child,
      th:first-child {
        text-align: left;
        padding-left: 15px;
      }
      td:nth-child(2),
      th:nth-child(2) {
        text-align: right;
      }
      td:last-child,
      th:last-child {
        text-align: right;
        padding-right: 15px;
      }

      // td:nth-child(1) {
      //   border-left: 3px solid transparent;
      //   vertical-align: middle;
      //   text-align: left;
      //   &::before {
      //     content: '';
      //     display: block;
      //     width: 0;
      //     height: 0;
      //     border: 5px solid transparent;
      //     border-left: 5px solid transparent;
      //   }
      // }
      &.active {
        td {
          background: var(--custom-bg-6-color);
        }
        .main {
          color: var(--custom-text-1-color);
          &.color-sol{
            /* color:#ffa622 */
          }
          &.red{
            color:#F6465D
          }
          &.green{
            color:#12B886
          }
        }
        // td:nth-child(1) {
        //   border-left: 3px solid #3f80f7;
        //   &::before {
        //     border-left: 5px solid #3f80f7;
        //   }
        // }
      }
    }
  }

  .progress {
    margin-left: 3px;
    :deep().el-progress__text {
      min-width: 12px;
    }
    .icon-suo1 {
      font-size: 10px;
      width: 10px;
      height: 10px;
      color: var(--custom-text-2-color);
    }
  }
  .flex-baseline {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
  }
  .icon-symbol.icon-svg {
    border-radius: 50%;
    margin-right: 5px;
    font-size: 16px;
  }
  .collapse-button {
    font-size: 16px;
    color: var(--custom-text-2-color);
    line-height: 1;
    padding: 0;
    text-align: center;
    cursor: pointer;
    button {
      border: none;
      background: transparent;
      padding: 0 5px;
      cursor: pointer;
    }
    .collapse {
      transition: all 0.5s;
      transform: rotateZ(-90deg);
    }
    .expand {
      transition: all 0.5s;
      transform: rotateZ(90deg);
    }
  }
</style>
