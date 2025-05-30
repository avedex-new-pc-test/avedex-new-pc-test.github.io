<template>
  <footer class="h-40px bg-[--d-222-l-F2F2F2]  w-full px-12px py-16px footer">
    <ul class="left">
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a class="border-left" target="_blank" href="https://eco.ave.ai">{{ $t('ecosystem') }}</a>
      </li>
    </ul>
    <ul class="right">
      <!-- <li>
        <a
          target="_blank"
          :href="
            lang?.includes?.('zh')
              ? 'https://doc.ave.ai/cn'
              : 'https://doc.ave.ai'
          "
        >
          {{ $t('tutorial') }}
        </a>
      </li>
      <li>
        <a
          target="_blank"
          href="https://blog.ave.ai/"
        >
          {{ $t('blog') }}
        </a>
      </li> -->
      <!-- <li class="sr-only">
          <el-tooltip effect="customized" placement="top" :popper-class="$store.state.mode">
            <template #content>
              <ul class="support">
                <li v-for="(item, $index) in list" :key="$index"><a :href="item.src" :title="item.title" target="_blank">{{ item.title }} <i class="iconfont icon-share font-8"></i></a></li>
              </ul>
            </template>
            <a href @click.stop.prevent> {{ $t('alternative') }}</a>
          </el-tooltip>
      </li> -->
      <!-- <li v-if="lang === 'en'">
        <a target="_blank" href="/user_agreement.html">User Agreement</a>
      </li> -->
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a class="border-left" target="_blank" href="https://eco.ave.ai">{{ $t('ecosystem') }}</a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a target="_blank" href="https://cloud.ave.ai">API</a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px"/>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a
          class="border-left"
          target="_blank"
          :href="
            lang?.includes?.('zh')
              ? 'https://doc.ave.ai/cn/mian-ze-shen-ming'
              : 'https://doc.ave.ai/disclaimers'
          "
        >
          {{ $t('disclaimers') }}
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a target="_blank" href="/privacy.html">{{ $t('privacyPolicy') }}</a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px"/>
      <li class="color-[--d-999-l-666]">
        <span class="partners">{{ $t('partners') }}</span>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a target="_blank" href="https://www.tradingview.com/" class="flex-center">
          <Icon name="simple-icons:tradingview" class="text-18px mr-2px"/>TradingView
          <!-- <img v-if="isDark" src="@/assets/images/tradingView-dark.svg" alt="" height="12" />
          <img v-else src="@/assets/images/tradingView-light.svg" alt="" height="12" /> -->
        </a>
      </li>
      <li class="bg-[--d-999-l-666] w-1px h-8px"/>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a target="_blank" :href="lang?.includes?.('zh') ? 'https://x.com/aveai_info' : 'https://x.com/AveaiGlobal'" class="flex-center">
          <Icon name="bi:twitter-x" class="text-16px"/>
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a target="_blank" :href="lang?.includes?.('zh') ? 'https://x.com/aveai_info' : 'https://x.com/AveaiGlobal'" class="flex-center">
          <Icon name="lineicons:telegram-original" class="text-19px"/>
        </a>
      </li>
      <li class="color-[--d-999-l-666] hover:color-[--d-F5F5F5-l-333]">
        <a  href="mailto:avebusiness100@ave.ai" class="flex-center">
          <Icon name="material-symbols:mail" class="text-20px"/>
        </a>
      </li>
    </ul>
  </footer>
</template>

<script setup lang='ts'>
  const {mode,lang,isDark} = storeToRefs(useGlobalStore())
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
    gap:12px;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
