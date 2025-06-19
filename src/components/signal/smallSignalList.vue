<script setup lang="ts">
import type {GetSignalV2ListResponse} from '~/api/signal'

withDefaults(defineProps<{
  signalList?: Array<GetSignalV2ListResponse>
}>(), {
  signalList() {
    return []
  },
})
</script>

<template>
  <div class="flex flex-col gap-12px">
    <div
      v-for="({chain,logo,symbol,id,token,issue_platform,mc,signal_time}) in signalList"
      :key="id"
      class="pb-12px border-b-1px border-b-solid border-b-[--d-1A1A1A-l-F2F2F2]"
    >
      <div class="flex justify-between mb-4px">
        <div class="flex items-center gap-8px">
          <NuxtLink
            :to="`/token/${token}-${chain}`"
          >
            <TokenImg
              token-class="w-32px h-32px"
              :row="{
              chain,
              logo_url:logo,
              symbol
           }"
            />
          </NuxtLink>
          <div class="flex flex-col gap-4px">
            <span class="font-500 color-[--d-F5F5F5-l-333] text-16px">{{ symbol }}</span>
            <div class="color-[--d-666-l-999] flex items-center gap-8px">
              <Icon v-copy="token" name="bxs:copy" class="clickable text-10px"/>
              <a
                class="text-10px"
                :href="`https://x.com/search?q=($${symbol} OR ${token})&src=typed_query&f=live`"
                target="_blank"
              >
                <Icon
                  name="hugeicons:search-01"
                />
              </a>
              <img
                v-if="issue_platform"
                v-tooltip="issue_platform"
                :src="formatIconTag(issue_platform)"
                width="10"
                height="10"
                class="rounded-full"
                alt=""
              >
            </div>
          </div>
        </div>
        <div/>
      </div>
      <div class="flex justify-between">
        <div class="flex color-[--d-666-l-999] text-12px">
          {{ $t('mCap') }}
          <span class="color-[--d-F5F5F5-l-333] ml-4px">
            ${{ formatNumber(mc, 1) }}
          </span>
          <span class="ml-8px">24h</span>
          <span class="ml-4px">+342.23%</span>
        </div>
        <TimerCount
          v-if="signal_time && Number(formatTimeFromNow(signal_time, true)) < 60"
          :key="signal_time" :timestamp="signal_time" :end-time="60">
          <template #default="{ seconds }">
              <span v-if="seconds < 60" class="color-#FFA622 text-12px">
                {{ seconds }}s
              </span>
            <span v-else class="color-[--d-999-l-666] text-12px">
                {{ formatTimeFromNow(signal_time) }}
              </span>
          </template>
        </TimerCount>
        <span v-else class="color-[--d-999-l-666] text-12px">
            {{ formatTimeFromNow(signal_time) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
