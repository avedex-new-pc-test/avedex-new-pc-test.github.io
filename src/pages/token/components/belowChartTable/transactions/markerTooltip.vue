<script setup lang="ts">
import {getTxsUserBrief} from '~/api/token'
import {BigNumber} from 'bignumber.js'
import {getColorClass} from '~/utils'
import dayjs from 'dayjs'

const props = defineProps({
  virtualRef: {
    type: HTMLElement,
    default: null
  },
  currentRow: {
    type: Object,
    default: () => ({})
  },
  addressAndChain: {
    type: Object,
    default: () => ({})
  }
})
const themeStore = useThemeStore()
const visible = shallowRef(false)
const isLoading = shallowRef(false)
const userBriefData = ref()
watch(() => props.currentRow, () => {
  if (props.currentRow) {
    _getTxsUserBrief()
  }
}, {
  immediate: true
})

async function _getTxsUserBrief() {
  const data = {
    user_address: props.currentRow.wallet_address,
    chain: props.addressAndChain.chain,
    token: props.addressAndChain.address
  }
  isLoading.value = true
  try {
    const res = await getTxsUserBrief(data)
    if (res) {
      const vol = new BigNumber(
        res.total_sold_usd === '--' ? 0 : res.total_sold_usd
      ).plus(
        new BigNumber(res.total_purchase_usd === '--' ? 0 : res.total_purchase_usd)
      ).toString()
      userBriefData.value = {
        ...res,
        // 总买入
        // boughtCount: ((res.total_purchase == '--') || (Number.parseFloat(res.total_purchase) == 0)) ? '' : `(${res.total_purchase})`,
        // boughtAmount: res.total_purchase_amount ? formatNumber(res.total_purchase_amount, 2) : '--',
        // isEmptyBoughtAmount: (!res.total_purchase_amount || (res.total_purchase_amount == '--') || (Number.parseFloat(res.total_purchase_amount) == 0)),
        // boughtUsd: res.total_purchase_usd ? '$' + formatNumber(res.total_purchase_usd, 1) : '--',
        // 总卖出
        // soldCount: ((res.total_sold == '--') || (Number.parseFloat(res.total_sold) == 0)) ? '' : `(${res.total_sold})`,
        // soldAmount: res.total_sold_amount ? formatNumber(res.total_sold_amount, 2) : '--',
        // isEmptySoldAmount: (!res.total_sold_amount || (res.total_sold_amount == '--') || (Number.parseFloat(res.total_sold_amount) == 0)),
        // soldUsd: res.total_sold_usd ? '$' + formatNumber(res.total_sold_usd, 1) : '--',
        // 转入
        transferInCount: ((res.total_transfer_in == '--') || (Number.parseFloat(res.total_transfer_in) == 0)) ? '' : `(${res.total_transfer_in})`,
        transferInAmount: res.total_transfer_in_amount ? formatNumber(res.total_transfer_in_amount, 2) : '--',
        isEmptyTransferInAmount: (!res.total_transfer_in_amount || (res.total_transfer_in_amount == '--') || (Number.parseFloat(res.total_transfer_in_amount) == 0)),
        // 转出
        transferOutCount: ((res.total_transfer_out == '--') || (Number.parseFloat(res.total_transfer_out) == 0)) ? '' : `(${res.total_transfer_out})`,
        transferOutAmount: res.total_transfer_out_amount ? formatNumber(res.total_transfer_out_amount, 2) : '--',
        isEmptyTransferOutAmount: (!res.total_transfer_out_amount || (res.total_transfer_out_amount == '--') || (Number.parseFloat(res.total_transfer_out_amount) == 0)),
        // 余额
        // balance: res.balance_amount ? formatNumber(res.balance_amount, 3) : '--',
        // 持币时间
        holdTime: res.wallet_age,
        // 总盈亏
        // profit: res.total_profit !== '0' ? '$' + formatNumber(res.total_profit, 1) : '--',
        //是否盈利
        // isAdd$: ((res.total_profit != '0') || 0) && (Number(res.total_profit) > 0 ? 1 : 2),
        //是否是正未实现盈亏
        // isUnrealized$: ((res.unrealized_profit != '0') || 0) && (Number(res.unrealized_profit) > 0 ? 1 : 2),
        // 未实现盈亏
        // unrealized: res.unrealized_profit ? '$' + formatNumber(res.unrealized_profit, 2) : '--',
        // 百分比
        ratio: Number(res.history_max_balance_amount) > 0
          ? Math.min(new BigNumber(res.balance_amount)
              .dividedBy(new BigNumber(res.history_max_balance_amount))
              .multipliedBy(100).toNumber()
            , 100)
          : 0,
        // balance_amount: res.balance_amount || 0,
        // balance_usd: res.balance_usd || 0,
        // history_max_balance_amount: res.history_max_balance_amount || 0,
        // isLoad
        isLoading: (res.total_sold_usd === '') && (res.total_purchase_usd === ''),
        // 总交易金额 = 总的卖出金额 + 总的买入金额
        vol: '$' + formatNumber(vol, 2),
        volColor: ((vol !== '0') || 0) && (Number(vol) > 0 ? 1 : 2),
      }
    }
  } catch (e) {
    console.log('=>(markerTooltip.vue:38) e', e)
  }
}
</script>

<template>
  <el-tooltip
    ref="tooltipRef"
    v-model:visible="visible"
    placement="left"
    :virtual-ref="virtualRef"
    virtual-triggering
    trigger="click"
    raw-content
  >
    <template #content>
      <el-skeleton
        v-if="!userBriefData || userBriefData.isLoading"
        animated
        class="relative inline-block [&&]:w-210px text-12px font-400 box-border px-4px py-6px"
      >
        <template #template>
          <el-skeleton-item v-for="i in 10" :key="i" variant="p" style="width: 100%"/>
        </template>
      </el-skeleton>
      <div v-else class="flex flex-col gap-10px w-210px color-[--d-F5F5F5-l-333]">
        <div class="flex gap-6px items-center">
          <UserAvatar
            class="relative"
            :chain="currentRow.chain"
            :address="currentRow.address"
            icon-size="20px"
          />
          <UserRemark
            :remark="currentRow.remark"
            :address="currentRow.wallet_address"
            :chain="currentRow.chain"
            :wallet_logo="currentRow.wallet_logo"
            class="color-[--d-999-l-666]"
          />
          <slot/>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('position1') }}:</span>
          <div>
            ${{ formatNumber(userBriefData.balance_usd || 0, 2) }}({{
              formatNumber(userBriefData.balance_amount || 0, 3)
            }}/{{ formatNumber(userBriefData.history_max_balance_amount || 0, 3) }})
            <el-progress
              :color="themeStore.isDark?'#F5F5F5':'#333'"
              :show-text="false"
              :percentage="userBriefData.ratio || 0"
              :stroke-width="4"
            />
          </div>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('profit2') }}:</span>
          <span :class="`${getColorClass(userBriefData.total_profit)}`">
            <template v-if="userBriefData.total_profit==='0'">--</template>
            <template v-else>
              {{ userBriefData.total_profit >= 0 ? '' : '-' }}${{
                formatNumber(Math.abs(userBriefData.total_profit), 1)
              }}
            </template>
          </span>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('unrealized_profit') }}:</span>
          <span>
            <template v-if="userBriefData.unrealized_profit==='0'">--</template>
            <template v-else>
              {{ userBriefData.unrealized_profit >= 0 ? '' : '-' }}${{
                formatNumber(Math.abs(userBriefData.unrealized_profit), 1)
              }}
            </template>
          </span>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('totalBuy2') }}
          <template
            v-if="userBriefData.total_purchase!=='--'&&Number.parseFloat(userBriefData.total_purchase)!==0">
            ({{ userBriefData.total_purchase }})
          </template>:</span>
          <span>
            <span class="color-#12B886 mr-10px">{{
                userBriefData.total_purchase_usd ? `$${formatNumber(userBriefData.total_purchase_usd)}` : '--'
              }}</span>
            <span>{{
                userBriefData.total_purchase_amount
                  ? formatNumber(userBriefData.total_purchase_amount)
                  : '--'
              }}</span>
         </span>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('totalSell2') }}
          <template
            v-if="userBriefData.total_sold!=='--'&&Number.parseFloat(userBriefData.total_sold)!==0">
            ({{ userBriefData.total_sold }})
          </template>:</span>
          <span>
            <span class="color-#F6465D mr-10px">{{
                userBriefData.total_sold_usd ? `$${formatNumber(userBriefData.total_sold_usd)}` : '--'
              }}</span>
            <span>{{
                userBriefData.total_sold_amount
                  ? formatNumber(userBriefData.total_sold_amount)
                  : '--'
              }}</span>
         </span>
        </div>
        <el-divider
          class="[--el-border-color:var(--d-333-l-F2F2F2)]"
          style="margin:0"
        />
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">{{ $t('walletAge') }}:</span>
          <TimerCount
            v-if="userBriefData.wallet_age && Number(formatTimeFromNow(userBriefData.wallet_age,true)) < 60"
            :key="userBriefData.wallet_age"
            :timestamp="userBriefData.wallet_age"
            :end-time="60"
          >
            <template #default="{seconds}">
              <span>
                <template v-if="seconds<60">
                  {{ seconds }}{{ $t('ss') }}
                </template>
                <template v-else>
                  {{ dayjs(userBriefData.wallet_age * 1000).fromNow() }}
                </template>
              </span>
            </template>
          </TimerCount>
          <span v-else>
            {{
              !!Number(userBriefData.wallet_age || 0)
                ? dayjs(userBriefData.wallet_age * 1000).fromNow()
                : '--'
            }}
          </span>
        </div>
        <el-divider
          class="[--el-border-color:var(--d-333-l-F2F2F2)]"
          style="margin:0"
        />
        <div v-if="userBriefData.top3_blue_chip?.length > 0">
          <div class="color-[--d-999-l-666]">TOP3 {{ $t('blueChips') }}:</div>
          <ul class="flex-wrap flex items-center gap-x-20px gap-y-6px">
            <li
              v-for="(item) in userBriefData.top3_blue_chip"
              :key="item.token"
              class="flex items-center"
            >
              <TokenImg
                :row="{
                  logo_url:item.logoUrl,
                }"
                token-class="w-16px h-16px [&&]:mr-0"
              />
              <span class="ml-3px">{{ item.symbol }}</span>
              <Icon v-copy="item.token" name="bxs:copy" class="ml-3px cursor-pointer"/>
            </li>
          </ul>
        </div>
        <div class="flex justify-center mt-10px">
          <img v-if="themeStore.isDark" src="@/assets/images/aveai.svg" alt="" class="h-14px">
          <img v-else src="@/assets/images/aveai-b.svg" alt="" class="h-14px">
        </div>
      </div>
    </template>
  </el-tooltip>
</template>

<style scoped>

</style>
