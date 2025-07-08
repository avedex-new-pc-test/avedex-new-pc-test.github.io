<template>
  <div class="bg-[--d-15171C-l-F8F8F8] h-full w-full flex flex-col min-h-90vh">
    <div
      v-if="address"
      class="top1 bg-custom-primary-lighter-0 px-25px pt-25px pb-10px flex items-center justify-start text-custom-font-1"
    >
      <div class="item flex items-center">
        <!-- <svg class="icon icon-svg" aria-hidden="true">
          <use :xlink:href="$store.state.mode==='light'? '#icon-dizhi2':'#icon-dizhi'"/>
        </svg> -->

        <TokenImg
          :row="{
            logo_url: '', //row.logo_url ? `${s3BaseUrl}${row.logo_url}`:'',
            chain: chain,
            symbol: chain,
          }"
          token-class="w-10 h-10"
        />
        <div class="ml-4px  flex flex-row items-center gap-2">
          <span class="text-[12px] color-#80838B">{{ $t('address') }}</span>
          <div v-copy="address" class="statistic-address flex gap-2.5 cursor-pointer">
            <div
              class="statistic-address-copy flex items-center justify-center px-2 py-1.75 h-6 rounded text-3 gap-1 text-[--d-666-l-959A9F] bg-[--d-222-l-F2F2F2]"
            >
              {{ address.slice(0, 6) + '...' + address.slice(-4) }}
              <Icon name="bxs:copy" class="text-2.5 clickable text-[--d-666-l-959A9F]" />
            </div>
          </div>

        </div>
      </div>
      <div class="item flex items-center ml-136px">
        <TokenImg
          :row="{
            logo_url: '', //row.logo_url ? `${s3BaseUrl}${row.logo_url}`:'',
            chain: chain,
            symbol: '$',
          }"
          token-class="w-10 h-10"
        />
        <div class="ml-4px flex flex-row items-center gap-2">
          <span class="text-12px color-80838B">{{ $t('totalBalance') }}</span>
          <span class="text-12px">
            {{ userTotalBalance || '-.-' }}
          </span>
        </div>
      </div>
    </div>
    <balance />
  </div>
</template>

<script setup>
import Balance from './balance'
// import {formatNumUnit} from '@/utils/formatNumber'

const props = defineProps({
  address: {
    type: String,
    default: '',
  },
  chain: {
    type: String,
    default: '',
  },
})

const userTotalBalance = computed(() => {
  return 0 //store.getters.userTotalBalance || 0
})

const init = () => {
  // store.dispatch('getUserTokenList', { id: props.address.value, chainId: chain.value })
}

watch(
  props.address,
  () => {
    init()
  },
  { immediate: true }
)
</script>

<style></style>
