<script setup lang="ts">
import imageEmptyBlack from '@/assets/images/empty-black.svg'
import imageEmptyWhite from '@/assets/images/empty-white.svg'
import UserTxsHead from './userTxsHead'
import { formatExplorerUrl, getAddressAndChainFromId, formatDate } from '@/utils/index'
import { formatNumber } from '@/utils/formatNumber'

const props = defineProps({
  tableList: Array as () => any[],
  userAddress: {
    type: String,
    default: ''
  },
  scrollHeight: {
    type: String,
    default: '350px'
  },
  loadingMyTx: Boolean
})

const emit = defineEmits(['changeLoadingHead'])
const { mode } = storeToRefs(useGlobalStore())
const route= useRoute()

const loadingHead = ref(props.userAddress !== '')

const { token } = storeToRefs(useTokenStore())
const id = computed(() => {
      return  route.params.id as string
  })
const tokenAddress = computed(() => {
  const data = id.value
  return (getAddressAndChainFromId(data)?.address || '').toLowerCase()
})

const loading = computed(() => loadingHead.value || props.loadingMyTx)

function isBuy(row: any) {
  if (row.from_address?.toLowerCase?.() === tokenAddress.value) return false
  if (row.to_address?.toLowerCase?.() === tokenAddress.value) return true
  const m = row.amount0In > 0 ? row.token0Address : row.token1Address
  return m !== tokenAddress.value
}

function getAmount(row: any) {
  if (row.from_address?.toLowerCase?.() === tokenAddress.value) return row.from_amount
  if (row.to_address?.toLowerCase?.() === tokenAddress.value) return row.to_amount

  if (row.amount0In > 0) {
    return tokenAddress.value === row.token0Address ? row.amount0In : row.amount1Out
  }
  return tokenAddress.value === row.token1Address ? row.amount1In : row.amount0Out
}

function getPrice(row: any) {
  if (row.from_address?.toLowerCase?.() === tokenAddress.value) return row.from_price_usd
  if (row.to_address?.toLowerCase?.() === tokenAddress.value) return row.to_price_usd
  return tokenAddress.value === row.token0Address ? row.token0PriceUSD : row.token1PriceUSD
}

function getAmountUSD(row: any) {
  if (row.from_address?.toLowerCase?.() === tokenAddress.value) return Number(row.from_amount) * Number(row.from_price_usd)
  if (row.to_address?.toLowerCase?.() === tokenAddress.value) return Number(row.to_amount) * Number(row.to_price_usd)
  return row.amountUSD
}

function goLink(row: any) {
  window.open(formatExplorerUrl(row.network, row.transactionAddress, 'tx'))
}

function changeLoadingHead(val: boolean) {
  loadingHead.value = val
  emit('changeLoadingHead', val)
}
</script>

<template>
  <div class="histrory">
    <UserTxsHead
      :tableList="props.tableList"
      :userAddress="props.userAddress"
      @changeLoadingHead="changeLoadingHead"
    />

    <div class="top">
      <span>{{ $t('time') }}</span>
      <span>{{ $t('type') }}</span>
      <span>{{ $t('price') }}($)</span>
      <span>{{ $t('amountB') }}({{ token?.symbol }})</span>
      <span>{{ $t('amountU') }}($)</span>
      <span>Tx</span>
    </div>

    <el-scrollbar :height="props.scrollHeight">
      <ul class="content" v-if="props.tableList.length > 0">
        <li
          v-for="(row, index) in props.tableList"
          :key="index"
          class="flex"
          @click.stop="goLink(row)"
        >
          <span>{{ formatDate(row.timestamp) }}</span>
          <div :class="{ green: isBuy(row), red: !isBuy(row) }">
            <span>{{ isBuy(row) ? $t('buy') : $t('sell') }}</span>
          </div>
          <div :class="{ green: isBuy(row), red: !isBuy(row) }">
            <span v-html="formatNumber(getPrice(row) || 0)"></span>
          </div>
          <div :class="{ green: isBuy(row), red: !isBuy(row) }">
            {{ formatNumber(getAmount(row)) }}
          </div>
          <span>{{ formatNumber(getAmountUSD(row)) }}</span>
          <span>
            {{ row.transactionAddress?.slice(0, 2) }}...{{ row.transactionAddress?.slice(-4) }}
            <span v-if="row.count && row.count > 1" style="color: #558bed">({{ row.count }})</span>
          </span>
        </li>
      </ul>
      <el-empty
        v-if="!props.tableList || props.tableList.length === 0"
        :image-size="100"
        :image="mode === 'light' ? imageEmptyWhite : imageEmptyBlack"
      />
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.histrory {
  font-size: 12px;
  padding-bottom: 10px;
  position: relative;

  .top {
    color: #787b86;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;

    > * {
      flex: 1;
      text-align: right;
    }

    > :first-child {
      text-align: left;
    }
  }

  .content {
    padding-bottom: 20px;

    .flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      > * {
        flex: 1;
        text-align: right;
      }

      > :first-child {
        text-align: left;
      }

      div {
        padding: 10px 0;
      }

      &:hover {
        background-color: var(--d-333-l-F2F2F2);
      }
    }

    .green {
      color: #12b886;
    }

    .red {
      color: #ff646d;
    }
  }
}
</style>
