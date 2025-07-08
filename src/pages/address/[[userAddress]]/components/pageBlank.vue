<template>
  <div class="flex flex-col w-full h-full p-[10%] bg-[var(--d-111-l-FFF)] items-center pb-0">
    <div
      :class="`color-[var(--d-F5F5F5-l-333)] bg-[--d-111-l-FFF] rounded-2px text-14px overflow-hidden`"
    >
      <AveEmpty class="overflow-hidden">
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
  </div>
</template>

<script setup>
  const botStore = useBotStore()
</script>
