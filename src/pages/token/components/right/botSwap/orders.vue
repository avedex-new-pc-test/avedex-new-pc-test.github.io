<template>
  <div>
    <el-table
      class="table-orders"
      :data="tokenList"
      fit
      stripe
      style="width: 100%; min-height: 250px;">
      <template #empty>
        <div class="table-empty" v-if="!loading">
          <img
            :src="
              $store.state.mode === 'light'
                ? require('@/assets/images/empty-white.svg')
                : require('@/assets/images/empty-black.svg')
            "
          />
          <span>{{ $t('emptyNoData') }}</span>
        </div>
        <span v-else></span>
      </template>
      <el-table-column :label="$t('token')" align="left" width="110">
        <template #default="{ row }">
          <div class="flex-start">
            <div class="icon-token-container" style="margin-right: 5px">
              <el-image class="token-icon" :src="$f.formatIcon(row, row.symbol)">
                <template #error>
                  <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, row.symbol)" alt="" srcset="">
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="$f.formatDefaultIcon(row?.chain, row.symbol)" alt="" srcset="">
                </template>
              </el-image>
              <img
                v-if="row?.chain"
                class="icon-svg icon-symbol"
                :src="`${$store.state.s3BaseUrl}chain/${row.chain}.png`"
                alt=""
                onerror="this.src='/icon-default.png'"
                srcset=""
              />
            </div>
            <span class="token-symbol">{{ row.symbol}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('balance1')" align="right">
        <template #default="{ row }">
          <span>${{ $f.formatNumberS((Number(row?.value) || 0) * (Number(row?.current_price_usd) || 0)) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('amount')" align="right"  >
        <template #default="{ row }">
          <span>{{ $f.formatNumberS(row?.value || 0) }} {{ row?.symbol }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('costPrice')" align="right">
        <template #default="{ row }">
          <span>${{ $f.formatNumberS(row?.avgPrice || 0) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('currentPrice')" align="right">
        <template #default="{ row }">
          <span>${{ $f.formatNumberS(row?.current_price_usd || 0) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="PnL" align="right">
        <template #default="{ row }">
          <span v-if="row?.profitRate" :style="{ color: row?.profitRate > 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">{{ $f.formatNumberS(row?.profitRate || 0) }}%</span>
          <span v-else>--</span>
          <i style="cursor: pointer; font-size: 14px; color: var(--custom-text-2-color)" class="iconfont icon-share ml-5 clickable"></i>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'BotSwapOrders',
  data () {
    return {
      tokenList: [],
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
