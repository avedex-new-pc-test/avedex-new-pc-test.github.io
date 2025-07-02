<template>
  <el-drawer
    v-model="visible"
    class="pnl bg-[--d-222-l-FFF] color-[--d-F5F5F5-l-333]"
    :size="430"
    header-class="!mb-[20px]"
  >
    <template #header>
      <span class="pnl-title">{{ $t('pnlDetail') }}</span>
    </template>
    <el-divider style="margin: 0 0 20px; border-top-color: #33353d" />
    <div>
      <div class="pnl-row flex-between">
        <span class="pnl-row-name">{{ $t('Txs') }}</span>
        <span class="pnl-row-value">{{ eventsDetail.txns }}</span>
      </div>
      <div class="pnl-row flex-between">
        <span class="pnl-row-name">{{ $t('Vol') }}</span>
        <span class="pnl-row-value">${{ volume }}</span>
      </div>
      <div class="pnl-row flex-between">
        <span class="pnl-row-name">{{ $t('time') }}</span>
        <span class="pnl-row-value">{{ time }}</span>
      </div>
      <el-divider style="border-top-color: #33353d" class="!mb-[10px]"/>
      <div
        v-infinite-scroll="onLoad"
        :infinite-scroll-disabled="loading || finished || error"
        infinite-scroll-distance="300"
        :infinite-scroll-delay="200"
        :infinite-scroll-immediate="false"
      >
        <!-- <Loading
          v-if="pageNO === 1"
          :active="loading"
          :can-cancel="false"
          loader="dots"
          :opacity="0.2"
          :backgroundColor="mode === 'light' ? '#fff' : '#131722'"
          color="var(--custom-primary-color)"
          :is-full-page="false"
        /> -->
        <el-table
          ref="table_ref"
          :data="eventsDetail.events"
          fit
          style="width: 100%"
          class="table-container pointer"
          @row-click="tableRowClick"
        >
          <template #empty>
            <AveEmpty v-if="!loading" class="table-empty" />
          </template>
          <TokenColumn
            :columnProps="{
              label: $t('walletToken'),
              width: '142',
            }"
          />
          <el-table-column width="50" :label="$t('type')">
            <template #default="{ row }">
              <span
                class="font-12"
                :style="{
                  color: filterType(row?.flow_type)?.color == 'green' ? upColor : downColor,
                }"
              >
                {{ filterType(row?.flow_type)?.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column width="60" :label="$t('Vol')">
            <template #default="{ row }">
              <span class="font-12"> {{ formatNumber(row.volume, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('price')">
            <template #default="{ row }">
              <span class="font-12">
                ${{ row?.token_price_u > 0 ? formatNumber2(row?.token_price_u || 0, 2, 4, 4) : 0 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('time')">
            <template #default="{ row }">
              <span class="font-12">
                {{ dayjs(row.block_time * 1000).format('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt_20 font-14 tc" :style="{ color: mode === 'light' ? '#666' : '#999' }">
          <span v-if="loading && pageNO > 1">{{ $t('loading') }}</span>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import {formatNumber2} from '@/utils/formatNumber'
import { upColor, downColor } from '@/utils/constants'
import dayjs from 'dayjs'
import TokenColumn from '@/components/tokenColumn.vue'
// import Loading from '@/components/loading/js/Component.vue'
import AveEmpty from '@/components/aveEmpty.vue'

const $t = getGlobalT()
const props = defineProps({
  value: Boolean,
  eventsDetail: {
    type: Object,
    default: () => ({}),
  },
  handleSortChange: {
    type: Function,
    default: () => {},
  },
  conditions: {
    type: Object,
    default: () => ({}),
  },
  handleSort: {
    type: Function,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  pageNO: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  chain: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['input', 'detailOnLoad'])

const table_ref = ref(null)

const themeStore = useThemeStore()

const mode = computed(() => {
  return themeStore.isDark ? 'dark' : 'light'
})

const visible = computed({
  get: () => props.value,
  set: (val) => emit('input', val),
})

const volume = computed(() => {
  return typeof props.eventsDetail.volume === 'number'
    ? formatNumber(props.eventsDetail.volume, 2)
    : props.eventsDetail.volume
})

const time = computed(() => {
  const { start_time, end_time } = props.eventsDetail
  console.log('props.eventsDetail', props.eventsDetail)
  if (!start_time || !end_time) {
    return '--'
  }
  const [startDate, startTime] = formatTime(start_time)
  const [endDate, endTime] = formatTime(end_time)
  if (startDate === endDate) {
    return `${startDate} ${startTime}~${endTime}`
  } else {
    return `${startDate} ${startTime}~${endDate} ${endTime}`
  }
})

const formatTime = (date) => {
  const dayjsDate = dayjs(date * 1000)
  return [dayjsDate.format('YYYY-MM-DD'), dayjsDate.format('HH:mm')]
}

const filterType = (type) => {
  const o = {
    0: {
      name: $t('swap_buy'),
      color: 'green',
    },
    1: {
      name: $t('swap_sell'),
      color: 'red',
    },
  }
  return o[type]
}

const tableRowClick = (item) => {
  window.open(formatExplorerUrl(props.chain, item.tx_hash, 'tx'))
}

const onLoad = () => {
  emit('detailOnLoad')
}
</script>

<style scoped lang="scss">
.font-14 {
  font-size: 14px;
}
.font-12 {
  font-size: 12px;
}
.header {
  padding: 18px 20px;
}
.pnl {
  &-title {
    color: var(--d-fff-l-333);
  }

  &-row {
    padding: 0 20px;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 12px;

    &-name {
      color: #959a9f;
    }

    &-value {
      color: var(--d-fff-l-333);
    }
  }

  &-logos {
    margin-bottom: 30px;
    margin-top: 13px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    > img {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 10px; /* 修改为你需要的值 */
}
:deep(.cell) {
  font-weight: normal;
  padding: 0 5px;
}

.token-address {
  gap: 4px;
  font-size: 10px;
  color: var(--d-666-l-959a9f);

  .iconfont {
    font-size: 10px;
  }
}

.token-info {
  display: flex;
  align-items: center;

  .token-symbol {
    font-size: 14px;
    margin-right: 3px;
  }

  .token-icon {
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }
}
</style>
