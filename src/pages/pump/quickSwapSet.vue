<template>
  <div class="flex-start">
    <img src="@/assets/images/fast.svg" height="14" width="14" />
    <span class="ml-5px mr-10px color-[--d-999-l-666] text-12px">{{
      $t('quick')
    }}</span>
    <el-input
      v-model.trim="quickBuyValue1"
      style="
        background: var(--d-333333-l-eaecef);
        --el-input-bg-color: var(--d-333333-l-eaecef);
        --el-input-border-color: var(--d-333333-l-eaecef);
        border-radius: 4px;
        width: 88px;
        height: 28px;
      "
      class="one-click-input"
      placeholder="0"
      clearable
      type="text"
      @input="
        (value) => {
          quickBuyValue1 = value.replace(/\-|[^\d.]/g, '')
        }
      "
      @blur="handleBlurBuyValue(quickBuyValue1)"
    >
      <template #prefix>
        <img
          style="border-radius: 50%; width: 14px; height: 14px"
          :src="`${token_logo_url}chain/${chain}.png`"
          alt=""
          onerror="this.src='/icon-default.png'"
          srcset=""
        />
      </template>
    </el-input>
    <div
      v-if="chain && botStore.isSupportChains?.includes(chain)"
      class="ml-20px flex-end text-12px"
    >
      <span class="color-[--d-999-l-666] mr-10px">{{ $t('default') }}</span>
      <div class="tabs">
        <button
          v-for="item in ['s1', 's2', 's3']"
          :key="item"
          :class="{ active: item === botSettings?.[chain]?.selected }"
          type="button"
          @click.stop="botSettings[chain].selected = item"
        >
          {{ item.toUpperCase() }}
        </button>
      </div>
      <SlippageSetMarket :chain="chain" :showQuickAmount="false">
          <template #icon>
            <img class="ml-5 clickable mr-10" src="@/assets/images/setting.svg" height="14" alt="" srcset="" >
          </template>
        </SlippageSetMarket>
    </div>
  </div>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js'
import SlippageSetMarket from '../token/components/right/botSwap/slippageSetMarket.vue'
const props = defineProps({
  chain: {
    type: String,
    default: '',
  },
  quickBuyValue: {
    type: String,
    default: '0.01',
  },
})
// 定义 emit
const emit = defineEmits<{
  (e: 'update:quickBuyValue', value: string): void
}>()
const { chain, quickBuyValue } = toRefs(props)
const { token_logo_url } = useConfigStore()
const botStore = useBotStore()
const botSettingStore = useBotSettingStore()
const { botSettings } = storeToRefs(botSettingStore)

const quickBuyValue1 = computed({
  get: () => quickBuyValue.value,
  set: (value) => emit('update:quickBuyValue', value),
})
function handleBlurBuyValue(value: string) {
  const decimals = 4
  const v = value
  const v1 = new BigNumber(v || 0)
    ?.toFixed()
    ?.match(new RegExp(`[0-9]*(\\.[0-9]{0,${decimals || 18}})?`))?.[0]
  if (String(v) !== String(v1)) {
    if (v === '') {
      quickBuyValue1.value = ''
    } else if (Number(v1) === 0) {
      quickBuyValue1.value = '0'
    } else {
      quickBuyValue1.value = v1 || ''
    }
  }
}
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--d-333333-l-eaecef);
  padding: 1px;
  border-radius: 4px;
  font-size: 12px;
  height: 28px;

  button {
    border: none;
    // font-size: 14px;
    color: var(--d-999-l-666);
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
    border-radius: 4px;
    background: transparent;
    min-width: 36px;
    padding: 5px 10px;
    text-align: center;
    &.active {
      // color: var(--custom-font-4-color);
      color: var(--d-F5F5F5-l-333);
      background: var(--d-111-l-FFF);
    }
  }
}
</style>
