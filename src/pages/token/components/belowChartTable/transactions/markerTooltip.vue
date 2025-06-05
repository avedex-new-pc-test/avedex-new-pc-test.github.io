<script setup lang="ts">
import {getTxsUserBrief} from '~/api/token'
import {BigNumber} from 'bignumber.js'
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
      userBriefData.value = {
        ...res,
        ratio: Number(res.history_max_balance_amount) > 0
          ? Math.min(new BigNumber(res.balance_amount)
              .dividedBy(new BigNumber(res.history_max_balance_amount))
              .multipliedBy(100).toNumber()
            , 100)
          : 0,
        // isLoad
        isLoading: (res.total_sold_usd === '') && (res.total_purchase_usd === ''),
      }
    }
  } catch (e) {
    console.log('=>(markerTooltip.vue:38) e', e)
  } finally {
    isLoading.value = false
  }
}

function getColorClass(val: string) {
  if (Number(val) > 0) {
    return 'color-#12b886'
  } else if (Number(val) < 0) {
    return 'color-#ff646d'
  } else {
    return 'color-#848E9C'
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
    trigger="hover"
    raw-content
    popper-class="[&&]:p-20px [&&]:[--el-text-color-primary:--d-222-l-FFF]"
    style="--el-text-color-primary:var(--d-222-l-FFF)"
  >
    <template #content>
      <el-skeleton
        v-if="!userBriefData || userBriefData.isLoading || isLoading"
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
            :canEdit="false"
            :remark="currentRow.remark"
            :address="currentRow.wallet_address"
            :chain="currentRow.chain"
            :wallet_logo="currentRow.wallet_logo"
            class="color-[--d-999-l-666]"
            :formatAddress="(address: string) => address.slice(0, 4) + '...' + address.slice(-4)"
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
          <span class="color-[--d-999-l-666]">7D {{ $t('winRate2') }}:</span>
          <span>{{ formatNumber(userBriefData.win_ratio) }}%</span>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">7D {{ $t('profit2') }}:</span>
          <span :class="`${getColorClass(userBriefData.profit)}`">
            <template v-if="userBriefData.profit==='0'">--</template>
            <template v-else-if="userBriefData.profit<0">-</template>${{ formatNumber(Math.abs(userBriefData.profit)) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="color-[--d-999-l-666]">7D {{ $t('token') }}:</span>
          <span>{{ formatNumber(userBriefData.token_txns) }}</span>
        </div>
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
              class="flex items-center color-[--d-999-l-666]"
            >
              <TokenImg
                :row="{
                  logo_url: item.logoUrl,
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
