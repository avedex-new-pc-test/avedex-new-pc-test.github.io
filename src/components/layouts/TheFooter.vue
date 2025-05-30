<template>
  <footer class="h-40px bg-[--d-222-l-F2F2F2]  w-full px-12px py-16px footer">
    <ul class="left gap-12px">
      <li v-for="item in data" :key="item.symbol || item.logo_url" class="color-[--d-999-l-666]  flex items-center gap-5px">
        <TokenImg 
        :row="{
          logo_url: item.logo_url,
        }" token-class="w-16px h-16px [&&]:mr-0" />
        <span>{{ item.symbol }}</span>
        <span :class="`color-${item.color}`">{{'$'+formatDec(item.current_price_usd, 2)}}</span>
      </li>
    </ul>
    <ul class="right">
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a class="border-left" target="_blank" href="https://eco.ave.ai">{{ $t('ecosystem') }}</a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a target="_blank" href="https://cloud.ave.ai">API</a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px" />
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a class="border-left" target="_blank" :href="lang?.includes?.('zh')
            ? 'https://doc.ave.ai/cn/mian-ze-shen-ming'
            : 'https://doc.ave.ai/disclaimers'
          ">
          {{ $t('disclaimers') }}
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a target="_blank" href="/privacy.html">{{ $t('privacyPolicy') }}</a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px" />
      <li class="color-[--d-999-l-666]">
        <span class="partners">{{ $t('partners') }}</span>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a target="_blank" href="https://www.tradingview.com/" class="flex-center">
          <Icon name="simple-icons:tradingview" class="text-18px mr-2px" />TradingView
          <!-- <img v-if="isDark" src="@/assets/images/tradingView-dark.svg" alt="" height="12" />
          <img v-else src="@/assets/images/tradingView-light.svg" alt="" height="12" /> -->
        </a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px" />
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a target="_blank" :href="lang?.includes?.('zh') ? 'https://x.com/aveai_info' : 'https://x.com/AveaiGlobal'"
          class="flex-center">
          <Icon name="bi:twitter-x" class="text-16px" />
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-#3F80F7">
        <a target="_blank" :href="lang?.includes?.('zh') ? 'https://x.com/aveai_info' : 'https://x.com/AveaiGlobal'"
          class="flex-center">
          <Icon name="lineicons:telegram-original" class="text-19px" />
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-FFF-l-000]">
        <a href="mailto:avebusiness100@ave.ai" class="flex-center">
          <Icon name="material-symbols:mail" class="text-20px" />
        </a>
      </li>
    </ul>
  </footer>
</template>

<script setup lang='ts'>
import { formatDec } from '~/utils/formatNumber'
import { getTokensPrice } from '@/api/token'
import { upColor, downColor } from '@/utils/constants'
const globalStore = useGlobalStore()
const { lang } = storeToRefs(globalStore)
const ids = [
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c-bsc',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2-eth',
  'So11111111111111111111111111111111111111112-solana',
]
const data = ref([])
onMounted(() => {
  // Add any initialization logic if needed
  initPage()
  globalStore.sendFooterPriceWs()
})
const initPage = () => {
  // Initialize the page or perform any setup tasks
  getTokensPrice(ids).then((res) => {
    console.log('Price data:', res)
    //WETH BTCB SOL
    const newVal = res.map(i=>{
      return {
        ...i,
        symbol: {WETH:'ETH',BTCB:'BTC',SOL:'SOL'}[i.symbol],
        logo_url: i.logo_url,
        color:i.price_change>=0?upColor:downColor
      }
    })
    data.value[0] = newVal.filter(i => i.symbol === 'BTC')[0]
    data.value[1] = newVal.filter(i => i.symbol === 'ETH')[0]
    data.value[2] = newVal.filter(i => i.symbol === 'SOL')[0]
  })
}
watch(()=>globalStore.footerTokensPrice, (newVal) => {
  console.log('globalStore.footerTokensPrice', newVal)
  if(data.value.length){
    for (let index = 0; index < data.value.length; index++) {
      const item = data.value[index]
      const newItem = newVal.filter(i => i.id === ids[index])?.[0]
      if(newItem){
        item.current_price_usd = newItem?.current_price_usd || item.current_price_usd
        item.color = newItem?.price_change>=0?upColor:downColor
      }
    }
  }
})
</script>

<style scoped lang="scss">
.footer {
  display: flex;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0px;
  justify-content: space-around;

  .left {
    flex: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .right {
    flex: auto;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
