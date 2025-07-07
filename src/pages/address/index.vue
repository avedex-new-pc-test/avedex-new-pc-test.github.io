<script setup lang="ts">
const props = defineProps({
  height: {
    type: Number,
    default: 370,
  },
})
const botStore = useBotStore()
</script>
<template>
  <div
    :style="`height: ${Math.max(height, 0)}px;`"
    :class="`color-[var(--d-F5F5F5-l-333)] bg-[--d-111-l-FFF] rounded-2px text-14px overflow-hidden
    `"
  >
    <AveEmpty  :style="{ height: `${props.height - 50}px` }" class="overflow-hidden">
      <span class="text-12px mt-10px">{{ $t('noWalletTip') }}</span>
      <el-button
        class="mt-10px"
        @click="
          botStore.$patch({
            connectVisible: true,
          })
        "
      >
        {{ $t('connectWallet') }}
      </el-button>
    </AveEmpty>
  </div>
</template>

<style scoped></style>
