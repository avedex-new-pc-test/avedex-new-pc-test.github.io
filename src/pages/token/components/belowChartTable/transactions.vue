<script setup lang="ts">
import TableDateFilter from './tableDateFilter.vue'
import {filterLanguage} from '~/pages/token/components/kLine/utils'
import {getPairLiq, getPairTxs, type GetPairTxsResponse} from '~/api/token'
import {formatDate, getAddressAndChainFromId} from '~/utils'
import dayjs from "dayjs";
import {MAIN_COIN} from "~/utils/constants";

const {t} = useI18n()
const activeTab = shallowRef('all')
const {totalHolders = []} = useTokenStore()
const {getWalletAddress} = useBotStore()
const route = useRoute()
const {locale} = useLocaleStore()
const tabs = computed(() => {
  const arr: Array<{ label: string, value: string }> = []
  if (Array.isArray(totalHolders)) {
    totalHolders.forEach(i => {
      const num = i.total_address
      if (num > 0) {
        arr.push({
          ...i,
          label: i?.[filterLanguage(locale)] + (i.type !== '31' ? `(${num})` : ''),
          value: i.type
        })
      }
    })
  }
  return [{
    label: t('all'),
    value: 'all'
  },
    {
      label: t('buy3'),
      value: 'buy'
    },
    {
      label: t('sell3'),
      value: 'sell'
    },
    {
      label: t('followed'),
      value: '-100'
    },
    {
      label: t('liquidity2'),
      value: 'liquidity'
    }, ...arr]
})
const columns = computed(() => {
  return [{key: 'time', dataKey: 'time', title: t('time'), headerClass: '!overflow-visible'},
    {key: 'type', dataKey: 'type', title: t('type')},
    {key: 'swapPrice', dataKey: 'swapPrice', title: t('swapPrice')},
    {key: 'amountB', dataKey: 'amountB', title: t('amountB')},
    {key: 'amountU', dataKey: 'amountU', title: t('amountU')},
    {key: 'makers', dataKey: 'makers', title: t('makers')},
    {key: 'DEX', dataKey: 'DEX', title: 'DEX/TXN'},]
})
const pairTxs = shallowRef<GetPairTxsResponse[]>([])
const tableView = ref({
  isShowDate: true
})
const tableFilterVisible = ref({
  timestamp: false
})
const tableFilter = shallowRef<{
  timestamp: string[]
}>({
  timestamp: []
})

const addressAndChain = computed(() => {
  const id = route.params.id as string
  if (id) {
    return getAddressAndChainFromId(id)
  }
  return {
    address: '',
    chain: ''
  }
})

onMounted(() => {
  _getPairTxs()
  _getPairLiq()
})
watch(() => route.params.id, () => {
  _getPairTxs()
  _getPairLiq()
})

function onTimestampConfirm(timestamp: string[]) {
  tableFilterVisible.value.timestamp = false
  tableFilter.value.timestamp = timestamp
}

async function _getPairTxs() {
  try {
    const res = await getPairTxs(route.params.id as string)
    pairTxs.value = [{
      "time": 1747627142,
      "id": "0000000049922512-1630",
      "chain": "bsc",
      "transaction": "0xbf77e19f964ba3a6883153a314357d01207f0cd8abb68be8ebbb5608620db5f7",
      "amm": "cakev2",
      "amount_eth": 16244232.747815464,
      "amount_usd": 10353483162.903763,
      "from_address": "0xa5240d4fe083188e507bdbaca1d5de6aac4f1dd2",
      "from_price_eth": 536987.7664335079,
      "from_price_usd": 343662286.4842988,
      "from_symbol": "RWA",
      "from_amount": 30.126911127842916,
      "to_address": "0xfce4c14daf3202c24445ff4361b69f28ef204511",
      "to_price_eth": 4338.193171026658,
      "to_price_usd": 2765006.550382556,
      "to_symbol": "Bitebi",
      "to_amount": 3744.4696691482677,
      "wallet_address": "0xc685395a1184b1c21e6ca2021e6f0cab47b61c38",
      "wallet_tag_v2": "6",
      "wallet_tag_extra": {},
      "newTags": [
        {
          "type": "6",
          "en": "Robot",
          "cn": "机器人",
          "tw": "機器人",
          "es": "Robot",
          "pt": "Robô",
          "tr": "Robot",
          "ja": "ロボット",
          "icon": "Robot.png",
          "color": "#e8a6a4",
          "extra_info": null,
          "nick_name": ""
        }
      ],
      "wallet_logo": {}
    }].map(el => {
      return {
        ...el,
        timestamp: Number(el.time) || 0,
        network: el.chain || 'bsc',
        transactionAddress: el.transaction,
        walletAddress: el.wallet_address,
      }
    })
  } catch (e) {
    console.log('=>(transactions.vue:62) e', e)

  }
}

async function _getPairLiq() {
  try {
    const res = await getPairLiq(route.params.id as string)
  } catch (e) {
    console.log("=>(transactions.vue:155) e", e);

  }
}

function isBuy(row: GetPairTxsResponse) {
  if (
    row.from_address &&
    addressAndChain.value.address.toLowerCase?.() === row.from_address?.toLowerCase?.()
  ) {
    return false
  }
  if (row.to_address && addressAndChain.value.address.toLowerCase?.() === row.to_address.toLowerCase?.()) {
    return true
  }
  const m = row.amount0In > 0 ? row.token0Address : row.token1Address
  return m !== addressAndChain.value.address
}

function getRowColor(row: GetPairTxsResponse) {
  if (row.type === 'addLiquidity') {
    return 'color-add'
  } else if (row.type === 'removeLiquidity' || row.type === 'CollectFee') {
    return 'color-remove'
  }
  return isBuy(row) ? 'green' : 'red'
}
</script>

<template>
  <div class="transactions">
    <div class="flex items-center px-12px mb-10px">
      <a
        v-for="(item) in tabs"
        :key="item.value" href="javascript:;"
        :class="`decoration-none text-12px lh-16px pb-8px text-center color-[--d-999-l-666] px-12px py-4px rounded-4px
         ${activeTab===item.value ? 'bg-[--d-222-l-F2F2F2] color-[--d-F5F5F5-l-333]':''}`"
        @click="activeTab=item.value"
      >
        {{ item.label }}
      </a>
    </div>
    <div class="text-12px">
      <AveTable
        :data="pairTxs"
        :columns="columns"
        class="h-560px"
      >
        <template #header-time>
          <div class="flex items-center gap-2px">
            <span>{{ $t('time') }}</span>
            <Icon
              :name="`${tableView.isShowDate?'custom:calendar':'custom:countdown'}`"
              class="color-[--d-666-l-999] cursor-pointer"
              @click.self="tableView.isShowDate=!tableView.isShowDate"
            />
            <TableDateFilter
              v-model:visible="tableFilterVisible.timestamp"
              @confirm="onTimestampConfirm"
            />
          </div>
        </template>
        <template #cell-time="{row}">
          <TimerCount
            v-if="!tableView.isShowDate && row.timestamp && Number(formatTimeFromNow(row.timestamp)) < 60"
            :key="row.timestamp"
            :timestamp="row.timestamp"
            :endTime="row.timestamp + 60"
          >
            <template #default="{formattedData}">
              {{ formattedData.seconds }}
            </template>
          </TimerCount>
          <span v-else>
            {{
              tableView.isShowDate
                ? formatDate(row.timestamp, 'YYYY-MM-DD HH:mm:ss')
                : dayjs(row.timestamp * 1000).fromNow()
            }}
          </span>
        </template>
        <template #cell-type="{row}">
          <span v-if="row.type !== undefined">
              <template v-if="row.type == 'removeLiquidity'">
                  {{ $t('removeLiq') }}
              </template>
              <template v-else-if="row.type == 'addLiquidity'">
                  {{ $t('addLiq') }}
              </template>
              <template v-else-if="row.type == 'CollectFee'">
                  {{ $t('CollectFee') }}
              </template>
              <template v-else>
                  {{ row.type }}
              </template>
          </span>
          <span v-else-if="isBuy(row)">{{ $t('buy') }}</span>
          <span v-else>{{ $t('sell') }}</span>
        </template>
      </AveTable>
    </div>
  </div>
</template>

<style>
.transactions {
  .el-table-v2__header-wrapper, .el-table-v2__header {
    --at-apply: overflow-visible;
  }
}
</style>
