<template>
  <div>
    <template v-for="(i, index) in tags" :key="index">
      <span
        v-if="Number(i.type)"
        class="mr-3px text-12px"
        :style="{
          color: i.color
        }"
      >
        [{{ i?.[filterLanguage(locale)] }}]
      </span>
      <div
        v-if="i.extra_info?.length > 0 && i.type == '9'"
        class="color-#F2AD41 mt-5px"
      >
        <template
          v-for="(lock, $index) in i?.extra_info"
          :key="$index"
        >
          <span class="block mt-5px">
            {{ $t('lockAmount') }}:
            {{ formatNumber(lock.amount, 4) }}
          </span>
          <span class="block mt-5px">
            {{ $t('lockDate') }}:
            {{ dayjs(lock.lockDate, 'YYYY-MM-DD') }}
          </span>
          <span class="block mt-5px">
            {{ $t('unlockDate') }}:
            {{ dayjs(lock.unlockDate, 'YYYY-MM-DD') }}
          </span>
        </template>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import {filterLanguage} from '~/pages/token/components/kLine/utils'
import dayjs from 'dayjs'

const {locale} = useLocaleStore()
defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})
</script>
