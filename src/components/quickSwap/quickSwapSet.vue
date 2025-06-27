<template>
  <div class="items-center inline-flex">
    <img src="@/assets/images/fast.svg" class="w-14px h-14px" alt="" srcset="">
    <span class="ml-5px mr-5px color-[--d-999-l-666] text-12px">{{ $t('quick') }}</span>
    <el-input
        v-model.trim="quickBuyValue1"
        style="
          background: var(--d-333-l-F2F2F2);
          --el-input-bg-color: var(--d-333-l-F2F2F2);
          --el-input-border-color: var(--d-333-l-F2F2F2);
          border-radius: 4px;
          width: 88px;
          height: 28px;
        "
        placeholder="0"
        clearable
        type="text"
        @input="(value) => {
            quickBuyValue1 = value.replace(/\-|[^\d.]/g, '')
      }"
        @blur="handleBlurBuyValue(quickBuyValue1)">
      <template #prefix>
        <img
            class="rounded-full w-14px h-14px mr-4px!"
            :src="`${configStore.token_logo_url}chain/${chain}.png`"
            alt=""
            onerror="this.src='/icon-default.png'"
            srcset=""
        >
      </template>
    </el-input>
    <div
        v-if="chain && botStore.isSupportChains.includes(chain)"
        class="ml-20px flex justify-end items-center text-12px">
      <span class="color-[--d-999-l-666] mr-5px">{{ $t('default') }}</span>
      <div
          class="flex items-center justify-between p-1px rounded-4px text-12px h-28px bg-[--d-333-l-F2F2F2] px-2px py-2px">
        <button
            v-for="item in ['s1', 's2', 's3']" :key="item"
            class="color-[--d-999-l-666] cursor-pointer border-none font-400 rounded-4px min-w-36px py-5px px-10px text-center"
            :class="`${item === botSettingStore.botSettings?.[chain]?.selected?'color-[--d-F5F5F5-l-333] bg-[--d-111-l-FFF]':'bg-transparent'}`"
            type="button"
            @click.stop="botSettingStore.botSettings[chain].selected = item">
          {{ item.toUpperCase() }}
        </button>
      </div>
    </div>
    <SlippageSet
        class="ml-12px"
        :chain="chain"
        :setting="botSettingStore?.botSettings[chain]"
    />
  </div>
</template>
<script setup lang="ts">
import BigNumber from 'bignumber.js'
import SlippageSet from '~/pages/token/components/right/botSwap/slippageSet.vue'

const botStore = useBotStore()
const configStore = useConfigStore()
const botSettingStore = useBotSettingStore()
const emit = defineEmits(['update:quickBuyValue'])
const props = withDefaults(defineProps<{
  chain: string
  quickBuyValue?: string
}>(), {
  quickBuyValue: '0.01'
})
const quickBuyValue1 = computed({
  get() {
    return props.quickBuyValue
  },
  set(value) {
    emit('update:quickBuyValue', value)
  }
})

function handleBlurBuyValue(value: string) {
  const decimals = 4
  const v = value
  const v1 = new BigNumber(v || 0)
      .toFixed()
      .match(new RegExp(`[0-9]*(\\.[0-9]{0,${decimals || 18}})?`))[0]
  if (String(v) !== String(v1)) {
    if (v === '') {
      quickBuyValue1.value = ''
    } else if (Number(v1) === 0) {
      quickBuyValue1.value = '0'
    } else {
      quickBuyValue1.value = v1
    }
  }
}
</script>
