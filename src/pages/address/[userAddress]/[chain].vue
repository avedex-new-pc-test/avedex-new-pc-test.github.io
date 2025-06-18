<template>
  <div class="flex-between mx-4">
    <el-select
      :style="{ width: '120px' }"
      :model-value="chain"
      @change="
        (val) => {
          $router.push({
            name: 'Balance',
            params: { chain: val, userAddress: getBot(val)?.address },
          })
        }
      "
    >
      <template #prefix>
        <ChainToken :chain="chain" :width="16" />
      </template>
      <el-option
        v-for="chain in smartChains"
        :key="chain.name"
        :label="chain.name"
        :value="chain.name"
      >
        <div class="flex-center" style="gap: 4px">
          <ChainToken :chain="chain" :width="16" />
          {{ chain.name }}
        </div>
      </el-option>
    </el-select>
    {{ $t('hideSmallAssets1') }}
    <el-radio-group v-model="radio3">
      <el-radio-button label="24H" value="24h" />
      <el-radio-button label="7D" value="7d" />
      <el-radio-button label="30D" value="30d" />
    </el-radio-group>
  </div>
</template>
<script setup>
const radio3 = ref('24h')
const smartChains = [
  {
    name: 'solana',
  },
  { name: 'bsc' },
]
</script>
