<template>
  <el-popover ref="popoverRef" :visible="monitorVisible" :width="720" placement="top" :persistent="true" :teleported="true" popper-class="" popper-style="">
    <div class="">
      <AveTable
        ref="aveTableRef"
        rowKey="id"
        fixed 
        :data="dataSource"
        :columns="columns"
        :style="{
          height:'365px'
        }"
        row-class='cursor-pointer'
        :rowEventHandlers="{
        // onMouseenter:()=>isHoverTable=true,
        // onMouseleave:()=>isHoverTable=false,
        onClick: (row)=>jumpToken(row)
      }"> 
        <template #header-wallet>
          <span>{{ $t('wallet') }}</span>
        </template>
        <template #cell-wallet="{ row }">
            <UserRemark
              :key="row._marker.maker_address" :address="row._marker.maker_address" :chain="row.chain" :remark="row.maker_alias || ''" :showIcon="true" :teleported="true" :wallet_logo="row.wallet_logo" iconSize="24px" :formatAddress="
                  (address) =>
                    address?.slice(0, 4) + '...' + address?.slice(-4)
              "
              @updateRemark="init"
              @click="(e) => jumpBalance(row, e)" />
        </template>
         <template #header-type>
          <span>{{ $t('type') }}</span>
        </template>
        <template #cell-type="{ row }">
          <pro-tag :type="row._marker.isBuy?'success':'danger'"> {{ getTxType(row) }}</pro-tag>
        </template>
        <template #header-amount>
          <span>{{ $t('amount') }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span>
            {{ row?._main_Token?.amount+row?._main_Token?.symbol }}
          </span>
        </template>
        <template #header-mc>
          <span>{{ $t('mcap') }}</span>
        </template>
        <template #cell-mc="{ row }">
          <span>{{ row?._mc }}</span>
        </template>
        <template #header-time>
          <span>{{ $t('time') }}</span>
        </template>
        <template #cell-time="{ row }">
          <TimerCount
              v-if="row?.time && Number(formatTimeFromNow(row?.time, true)) < 60"
              :key="row?.time" :timestamp="row?.time" :end-time="60">
              <template #default="{ seconds }">
            <span v-if="seconds < 60" class="color-#FFA622 text-12px">
              {{ seconds }}s
            </span>
                <span v-else class="color-[--d-999-l-666] text-12px">
              {{ formatTimeFromNow(row?.time) }}
            </span>
              </template>
            </TimerCount>
            <div v-else class="color-[--d-999-l-666] text-12px">
              {{ formatTimeFromNow(row?.time) }}
            </div>
        </template>
        <template #header-symbol>
          <span>{{ $t('token') }}</span>
        </template>
        <template #cell-symbol="{ row }">
          <TokenImg
          :row="{
            logo_url: row?._target_Token?.logo_url,
            chain: row?.chain
          }" token-class="w-16px h-16px [&&]:mr-4px" />
            <span>{{ row?._target_Token?.symbol }}</span>
            <img v-if="row?.amm=='pump'"  src="https://www.iconaves.com/signals/pump_king.png" style="width:12px;height:12px">
        </template>
        <!-- <template #header-operate>
          <span></span>
        </template>
        <template #cell-operate="{ row }">

        </template> -->
      </AveTable>
      <div
        v-loading="loading" class="text-12px" element-loading-background="transparent">
      </div>
      <!-- <el-table
        v-loading="loading" class='m-table' :data="dataSource" style="width: 100%" fit
        size="large" @row-click="jumpToken" :height="365">
      <template #empty>
        <div v-if="!loading" class="flex flex-col items-center justify-center py-30px">
          <img v-if="mode === 'light'" src="@/assets/images/empty-white.svg">
          <img v-if="mode === 'dark'" src="@/assets/images/empty-black.svg">
          <span>{{ t('emptyNoData') }}</span>
        </div>
        <span v-else />
      </template>
        <el-table-column
          v-for="col in columns" :key="col.prop" :label="col.label" :width="col.width" :prop="col.prop" :min-width="col.minWidth" 
          :align="col.align" :show-overflow-tooltip="col?.showOverflowTooltip || false" >
          <template #default="{ row }">
              <Column :row="row" :col="col" :customKeys="['wallet', 'time', 'symbol','operate','type']" >
                <div v-if="col?.prop === 'wallet'" class="flex-start">
                  <UserRemark :key="row._marker.maker_address" :address="row._marker.maker_address" :chain="row.chain" :remark="row.maker_alias || ''" :showIcon="true" :teleported="true" @updateRemark="init" :wallet_logo="row.wallet_logo" @click="(e) => jumpBalance(row, e)"
                  iconSize="24px"
                  :formatAddress="
                      (address) =>
                        address?.slice(0, 4) + '...' + address?.slice(-4)
                  " />
                </div>
                <div v-else-if="col?.prop === 'type'" class="flex-end">
                <pro-tag :type="row._marker.isBuy?'success':'danger'"> {{ getTxType(row) }}</pro-tag>
                </div>
                <div v-else-if="col?.prop === 'time'" class="flex-end">
                  <TimerCount
                    v-if="row?.time && Number(formatTimeFromNow(row?.time, true)) < 60"
                    :key="row?.time" :timestamp="row?.time" :end-time="60">
                    <template #default="{ seconds }">
                  <span v-if="seconds < 60" class="color-#FFA622 text-12px">
                    {{ seconds }}s
                  </span>
                      <span v-else class="color-[--d-999-l-666] text-12px">
                    {{ formatTimeFromNow(row?.time) }}
                  </span>
                    </template>
                  </TimerCount>
                  <div v-else class="color-[--d-999-l-666] text-12px">
                    {{ formatTimeFromNow(row?.time) }}
                  </div>
                </div>
                <div v-else-if="col?.prop === 'symbol'" class="flex-end">
                  <TokenImg
                    :row="{
                      logo_url: row?._target_Token?.logo_url,
                      chain: row?.chain
                    }" token-class="w-16px h-16px [&&]:mr-4px" />
                    <span>{{ row?._target_Token?.symbol }}</span>
                    <img v-if="row?.amm=='pump'"  src="https://www.iconaves.com/signals/pump_king.png" style="width:12px;height:12px">
                </div>
              </Column>
          </template>
        </el-table-column>
      </el-table> -->
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js'
import { getHistoryMonitor} from '~/api/attention'
import Column from './components/columns.vue'
import { defaultPaginationParams, downColor, upColor } from '@/utils/constants'
import type {RowEventHandlers} from 'element-plus'
import type {AveTable} from '#components'
const { t } = useI18n()
const {monitorVisible} = storeToRefs(useFollowStore())
const { mode } = storeToRefs(useGlobalStore())
const dataSource = ref<any[]>([])
const loading=ref(false)
const botStore = useBotStore()

const aveTableRef = ref<InstanceType<typeof AveTable> | null>(null)
onMounted(async () => {
  init()
})
const columns = computed(() => {
  return [
    {
      title: t('wallet'),
      dataKey: 'wallet',
      key: 'wallet',
      align: 'left',
      minWidth: 110,
    },
    {
      title: t('type'),
      dataKey: 'type',
      key: 'type',
      // minWidth: ,
      align: 'right',
      // sortable: false,
      // style: (row) => {
      //   return row._marker.isBuy?`{color:${upColor[0]}}`:`{color:${downColor[0]}}`
      // },
      // customFormatter: (row: any) => {
      //   return row?._type
      // }
    },
    {
      title: t('value'),
      dataKey: 'amount',
      key: 'amount',
      align: 'right',
      minWidth: 100,
      // style: (row) => {
      //   return row._marker.isBuy?`{color:${upColor[0]}}`:`{color:${downColor[0]}}`
      // },
      // customFormatter: (row: any) => {
      //   return row?._main_Token?.amount+row?._main_Token?.symbol
      // }
    },
    {
      title: t('token'),
      dataKey: 'symbol',
      key: 'symbol',
      align: 'right',
      minWidth: 150,
      // customClassName: () => { },
      // customFormatter: (row: any) => {
      //   return row?._target_Token?.symbol
      // }
    },
    {
      title: t('mcap'),
      dataKey: 'mc',
      key: 'mc',
      align: 'right',
      // minWidth: 100,
      // sortable: false,
      // customClassName: () => { },
      // customFormatter: (row: any) => {
      //   return row?._mc
      // }
    },
    {
      title: t('time'),
      dataKey: 'time',
      key: 'time',
      align: 'right',
      // minWidth: 100,
    },
    // {
    //   title: '',
    //   dataKey: 'operate',
    //   key: 'operate',
    //   align: 'right',
    //   minWidth: 100,
    // }
  ]
})
// const filterDataSource = computed(() => {
//   return dataSource.value.filter((item: any) => {
//     return item?.msg_content && item?.msg_content !== '{}'
//   })
// })


function init() {
  if(!botStore.evmAddress) return
  loading.value = true
  getHistoryMonitor({}).then((res) => {
    let result = res || res?.data|| []
    const list: any[]=[]
    const listObj: Record<string, boolean> = {}
    result=Array.isArray(result)?result:[]
    result?.forEach?.((i: { msg_content: string }) => {
      const j = JSON.parse(i.msg_content)
      if (!listObj[j.id]) {
        list.push({
          ...j,
          ...formateTxInfo(j)
        })
        listObj[j.id] = true
      }
    })
    console.log('list', list)
    dataSource.value = list
  }).catch((err) => {
    console.error(err)
  }).finally(() => {
    loading.value = false
  })
}
function getIsBuy(item) {
  // console.log('item', item)
  if (item.position_type !== undefined) {
    return item.position_type === 0 || item.position_type === 1
  } else {
    return item.tx_type === 0
  }
}
function getTxType(item) {
  // console.log('item', item)
  if (item.position_type !== undefined) {
    // let p = [t('buy'), t('sell')]
    const types = [t('createPosition'), t('addPosition'), t('reducePosition'), t('closePosition')]
    return types?.[item?.position_type] || ''
  } else {
    const types = [t('buy'), t('sell')]
    return types?.[item.tx_type] || ''
  }
}

const formateTxInfo = function(item)  {
  // const {
    // from_address = '',
    // from_symbol = '',
    // from_logo = '',
    // from_amount = '',
    // from_price_usd = '',
    // from_tags = [{ "label": "", "icon": "" }], // token的标签, 只有当时target token才会有
    // from_signals = [{ "label": "", "icon": "" }], // token 信号, 只有当时target token才会有

    // to_address = '',
    // to_symbol = '',
    // to_logo = '',
    // to_amount = '',
    // to_price_usd = '',
    // to_tags = [{ "label": "", "icon": "" }], // token的标签, 只有当时target token才会有
    // to_signals = [{ "label": "", "icon": "" }], // token 信号, 只有当时target token才会有

    // target_address = '',
    // position_type,// 0-建仓，1-加仓，2-减仓，3-清仓。注意 该字段可能没有时，就只显示 tx_type
    // tx_type, // 0-买入，1-卖出
    // maker_address = "", // 交易用户地址
    // maker_alias = "", // 用户地址的别名, 找 @Ethan 问表
    // maker_logo = "", // 用户的图像
    // maker_tags = [{ "key": "", "label": "", "icon": "" }], // 用户地址标签 @Ethan kol
    // avg_price_usd = '', // 平均成本价，用usd计价
    // pnl_ratio = '', // pnl 百分比
    // pnl_usd = '', // pnl 值
    // position_usd = '', // 当前持仓金额,
    // target_mcap='', // 主币市值，
  // } = item
  const isBuy = getIsBuy(item)
  const data = {
    ...item,
    _marker: {
      maker_address: item?.maker_address || item?.wallet_address,
      maker_alias: item?.maker_alias,
      maker_logo: item?.maker_logo,
      maker_tags: item?.maker_tags,
      isBuy
    },
    _profit: item?.pnl_usd=='--'?'--':'$' + formatNumber2(Math.abs(item?.pnl_usd || 0) || 0, 2),
    _profit_ratio: item?.pnl_usd=='--'?'--':formatNumber2((item?.pnl_ratio || 0) * 100 || 0 ,2, 4, 4)+'%',
    _mc: '$'+formatNumberS(item?.target_mcap || 0,{
      decimals:0,
      limit:3
    }),
    _type: getTxType(item),
    _rise: item?.pnl_usd=='--'? true: item?.pnl_usd >= 0
  }
  data['_main_Token'] = {
    amount: formatNumber2(item[isBuy ? 'from_amount' : 'to_amount'] || 0, 1),
    price: '$'+formatNumber2(item[isBuy ? 'from_price_usd' : 'to_price_usd'] || 0) ,
    symbol: item[isBuy ? 'from_symbol' : 'to_symbol'],
    total: '$'+formatNumber2(new BigNumber( item[isBuy ? 'from_amount' : 'to_amount']||0).times(item[isBuy ? 'from_price_usd' : 'to_price_usd'] || 0).toFixed(0)||0, 2,4,4) ,
    address: item[isBuy ? 'from_address' : 'to_address'],
    tags: item[isBuy ? 'from_tags' : 'to_tags'],
    signals:item[isBuy ? 'from_signals' : 'to_signals'],
  }
  data['_target_Token'] = {
    amount: formatNumber2(item[!isBuy ? 'from_amount' : 'to_amount'] || 0, 1),
    price: '$'+formatNumber2(item[!isBuy ? 'from_price_usd' : 'to_price_usd'] || 0) ,
    total:'',
    symbol: item[!isBuy ? 'from_symbol' : 'to_symbol'],
    address: item[!isBuy ? 'from_address' : 'to_address'],
    tags: item[!isBuy ? 'from_tags' : 'to_tags'],
    signals:item[!isBuy ? 'from_signals' : 'to_signals'],
    logo_url: item[!isBuy ? 'from_logo' : 'to_logo'],
  }
  return data
}
function jumpBalance(item, e) {
  if (e) {
    e.stopPropagation()
  }
  const chain = item?.chain || 'eth'
  const address = item?._marker?.maker_address || item?.wallet_address
  if (address) {
    navigateTo(`/address/${address}/${chain}`)
  }
}
function jumpToken(row) {
  // if (e) {
  //   e.stopPropagation()
  // }
  const addr = row?._target_Token?.address + '-' + row.chain
  navigateTo(`/token/${addr}`, {replace: true})
}
</script>

<style scoped lang="scss">
.m-table {
  .el-table.el-table{
    --el-table-header-bg-color: var(--d-222-l-F2F2F2);
    --el-table-tr-bg-color: transparent;
  }
  :deep() .cell{
    padding-top: 0;
    padding-bottom: 0;
  }
  :deep() .el-table__expand-icon {
    display: none;
  }
  :deep() th {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0px;
    color: var(--d-666-l-999);
    background: transparent;
  }

  :deep() td {
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0px;
    color: var(--d-F5F5F5-l-333);
    .cell{
      /* line-height: 1.5; */
    }
  }
}
</style>
