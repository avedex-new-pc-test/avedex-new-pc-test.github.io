<template>
  <div class="statistic p-20">
    <div>
      <div class="statistic-avatar">
        <UserAvatar
          :wallet_logo="{
            ...(statistics.wallet_logo || {}),
            ...(address === bot.userInfo?.evmAddress
              ? { name: bot.userInfo?.name }
              : {}),
          }"
          :address="address"
          :chain="chain"
          iconSize="60px"
        ></UserAvatar>
        <div>
          <div class="flex-start" style="margin-bottom: 6px">
            <UserRemark
              class="statistic-name"
              :key="address"
              :address="address"
              :remark="defaultRemark"
              :chain="chain"
              :wallet_logo="statistics.wallet_logo"
              iconEditSize="16px"
              :maxRemarkLength="15"
              @updateRemark="getWalletBasicInfo"
            ></UserRemark>
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
              <i class="iconfont icon-twitter2"></i>
              {{ $t("connect") }}
            </a>
          </div>
          <div class="statistic-media">
            <div class="statistic-address" v-copy="address">
              <div class="statistic-address-copy flex-center">
                {{ addressText }}
                <i class="iconfont icon-copy"></i>
              </div>
            </div>
            <div class="statistic-media-left">
              <i class="iconfont icon-time"></i>
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

        <el-switch
          inactive-value="U"
          :active-value="chain"
          v-model="currencyStandard"
        >
          <template #active-action>
            <ChainToken :chain="chain" :width="16" />
          </template>
          <template #inactive-action>
            <span class="statistic-money-u">$</span>
          </template>
        </el-switch>
      </div>
      <p class="total-profit">
        {{ $t("totalPnL2") }}（{{ intervalText }}）
        <Number :value="statistics.profit" :signVisible="isUSDT">
          {{
            $f.formatNumber2(
              Math.abs(statistics.profit / main_token_price),
              2,
              4,
              4
            )
          }}
          {{ main_token_symbol }}
        </Number>
        <Number :value="statistics.profit_ratio"
          >{{ $f.formatNumberS(Math.abs(statistics.profit_ratio * 100), 2) }}%
        </Number>
      </p>
      <p class="total-profit">
        {{ $t("winRate2") }}（{{ intervalText }}）<Number
          :value="statistics.win_rate"
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
          <i class="iconfont icon-yiguanzhu"></i>
          <span class="statistic-right-attention-text">{{
            $t("followed")
          }}</span>
          <span class="statistic-right-attention-cancel">{{
            $t("cancelFollowed")
          }}</span>
        </a>
        <a v-else class="statistic-right-attention" @click="addAttention">
          <i class="iconfont icon-guanzhushu"></i>{{ $t("follow") }}
        </a>
        <a class="statistic-right-share" @click="openShareDialog">
          <i class="iconfont icon-fenxiangtubiao"></i>{{ $t("share") }}
        </a>
      </div>
      <div>
        <div class="statistic-pnl"/>
        <AveEmpty
          style="height: 80px"
          v-if="pnl.dataset.source.length <= 0"
          :showText="false"
        />
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
      class="dialog-share dialog-wallet"
      v-model="share.dialogVisible"
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
                >
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
                >{{ $t("campaignTitle") }}</span
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
                onerror="this.src='/icon-default.png'"
              >
              <img
                v-else
                class="avatar"
                :src="$f.generateAvatarIcon(address || '')"
                alt=""
                width="40px"
                height="40px"
                onerror="this.src='/icon-default.png'"
              >
            </div>
            <span style="font-size: 14px; color: #999">
              {{ address?.slice(0, 4) + "..." + address?.slice(-4) }}
            </span>
          </div>
          <div class="mt-30" style="font-size: 40px">
            <span
              v-if="
                statistics?.total_profit_ratio > 0 ||
                statistics?.total_profit_ratio < 0
              "
              :style="{
                color:
                  statistics?.total_profit_ratio > 0
                    ? $store.getters.upColor[7]
                    : $store.getters.downColor[7],
              }"
            >
              {{ statistics?.total_profit_ratio > 0 ? "+" : ""
              }}{{
                $f.formatNumberS(statistics?.total_profit_ratio * 100 || 0, 2)
              }}%
            </span>
            <span
              v-else-if="statistics?.total_profit_ratio === 0"
              class="color-999"
              >0</span
            >
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
                  {{ $t("total_profit") }}
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
                    :style="{ color: $store.getters.upColor[7] }"
                    v-if="statistics?.total_profit > 0 > 0"
                  >
                    ${{
                      $f.formatNumber2(statistics?.total_profit || 0, 2, 4, 4)
                    }}
                  </span>
                  <span v-else-if="statistics?.total_profit == 0">0</span>
                  <span v-else-if="statistics?.total_profit == '--'">--</span>
                  <span :style="{ color: $store.getters.downColor[7] }" v-else>
                    {{
                      "-$" +
                      $f.formatNumber2(
                        Math.abs(statistics?.total_profit) || 0,
                        2,
                        4,
                        4
                      )
                    }}
                  </span>
                </td>
              </tr>
              <tr>
                <td
                  :style="{ width: $f.getTextWidth($t('winRate')) + 20 + 'px' }"
                >
                  {{ $t("winRate") }}
                </td>
                <td>
                  <span
                    v-if="statistics?.total_win_rate > 0"
                    :style="{ color: $store.getters.upColor[7] }"
                  >
                    {{
                      $f.formatNumber2(statistics?.total_win_rate || 0, 2) + "%"
                    }}
                  </span>
                  <span v-else-if="statistics?.total_win_rate === 0">0</span>
                  <span v-else-if="statistics?.total_win_rate === '--'"
                    >--</span
                  >
                  <span v-else :style="{ color: $store.getters.downColor[7] }">
                    {{
                      $f.formatNumber2(statistics?.total_win_rate || 0, 2) + "%"
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="invite">
            <div class="tr mt_10">
              <span class="font-20 font_weight_700 block">{{
                $t("campaignSubTitle")
              }}</span>
              <span class="font-12 font_weight_400 mt_10">{{
                $t("campaignDesc")
              }}</span>
            </div>
            <div class="ml_10">
              <img
                :src="share.qrcodeUrl"
                :alt="$t('campaignScan')"
                width="60px"
                height="60px"
              >
              <span class="font-14 font_weight_400 mt_5 block">{{
                $t("campaignScan")
              }}</span>
            </div>
          </div>
        </div>
        <div class="flex mt-20 text-12px" style="width: 300px; color: #999">
          <div
            class="flex-col flex-center clickable"
            @click.stop="downloadSharePoster"
          >
            <img
              src="@/assets/images/share/download.svg"
              height="48"
              alt=""
              srcset=""
            >
            <span class="mt-8">{{ $t("download") }}</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpX()">
            <img
              src="@/assets/images/share/twitter.svg"
              height="48"
              alt=""
              srcset=""
            >
            <span class="mt-8">Twitter</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpTg()">
            <img
              src="@/assets/images/share/tg.svg"
              height="48"
              alt=""
              srcset=""
            >
            <span class="mt-8">Telegram</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
