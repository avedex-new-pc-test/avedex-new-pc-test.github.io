<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    class="info flex items-center bg-[--d-111-l-FFF] mb-4px h-64px p-x-16px text-12px font-500 color-[--d-666-l-999]"
  >
    <Icon
      name="material-symbols:kid-star"
      class="color-#696E7C h-16px w-16px clickable"
      :class="collected ? 'color-#ffbb19' : ''"
      @click="collect"
    />
    <div class="token-info ml-16px flex items-center color-[--d-666-l-999]">
      <div
        v-if="getSymbolDefaultIcon(token)"
        class="icon-token-container relative"
      >
        <el-image
          class="token-icon rounded-100%"
          :src="getSymbolDefaultIcon(token)"
          lazy
        >
          <template #error>
            <img
              class="token-icon"
              :src="getChainDefaultIcon(token?.chain, token?.symbol)"
            />
          </template>
          <template #placeholder>
            <img
              class="token-icon"
              :src="getChainDefaultIcon(token?.chain, token?.symbol)"
            />
          </template>
        </el-image>
        <img
          v-if="token?.chain"
          class="icon-symbol rounded-100%"
          :src="`${token_logo_url}chain/${token?.chain}.png`"
        />
      </div>
      <div class="ml-8px">
        <div>
          <span
            class="text-16px leading-[1.25] color-[--d-F5F5F5-l-333] font-500"
            >{{ token?.symbol }}</span
          >
          <span class="ml-8px text-12px font-500">{{ token?.name }}</span>
        </div>
        <div class="clickable text-12px font-500">
          <a
            v-if="token?.token !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'"
            class="hover:color-[--d-F5F5F5-l-333]"
            :href="formatExplorerUrl(token?.chain as string, token?.token as string)"
            target="_blank"
          >
            {{
              token?.token?.replace(new RegExp('(.{4})(.+)(.{4}$)'), '$1...$3')
            }}
          </a>
          <Icon v-copy="token?.token" name="bxs:copy" class="ml-5px" />
          <span
            v-if="pair"
            v-tooltip="formatDate(pair?.created_at)"
            class="ml-5px hover:color-[--d-F5F5F5-l-333]"
            >{{ dayjs(pair?.created_at * 1000).fromNow() }}</span
          >
        </div>
      </div>
    </div>

    <div class="flex-1" />
    <div
      v-if="pair?.progress || (0 > 0 && pair?.progress) || 0 < 100"
      class="item"
    >
      <div class="flex items-center">
        <span>{{ $t('progress') }}</span
        ><span class="ml-5px">{{ formatNumber(pair?.progress || 0, 2) }}%</span>
        <Icon
          v-if="pair?.amm === 'unknown'"
          v-tooltip="pair?.amm"
          name="tdesign:help-circle-filled"
          class="ml-5px"
        />
        <a
          v-else
          v-tooltip="pair?.amm"
          :href="pair?.swap_url || '' + pair?.target_token || ''"
          target="_blank"
          class="ml-5px"
        >
          <img
            class="rounded-50% h-16px w-16px"
            :src="formatIconSwap(pair?.amm)"
            onerror="this.src='/icon-default.png'"
            height="16"
          />
        </a>
      </div>
      <el-progress
        class="mt-10px"
        :percentage="pair?.progress"
        :stroke-width="4"
        color="#1CC982"
        :show-text="false"
        style="width: 70px"
      />
    </div>
    <div class="item ml-24px">
      <span class="text-20px color-[--d-F5F5F5-l-333]">
        ${{ formatNumber(price || 0) }}</span
      >
      <span
        class="block mt-4px color-[--d-F5F5F5-l-333]"
        :class="priceChange > 0 ? `color-${upColor}` : `color-${downColor}`"
        >{{ priceChange > 0 ? '+' : '' }}{{ formatNumber(priceChange) }}%</span
      >
    </div>

    <div class="item ml-24px">
      <span>{{ $t('mcap') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(marketCap, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>{{ $t('24Volume') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(volume24, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>{{ $t('holders') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(token?.holders || 0, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>DEV</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">--</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getSymbolDefaultIcon,
  getChainDefaultIcon,
  formatExplorerUrl,
  formatDate,
  formatIconSwap,
} from '@/utils/index'
import { getFavoriteCheck, addFavorite, removeFavorite } from '@/api/fav'
import { upColor, downColor } from '@/utils/constants'
import { formatNumber } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
const { token_logo_url } = useConfigStore()
const tokenStore = useTokenStore()
const botStore = useBotStore()
const route = useRoute()
const id = route.params?.id as string

const token = computed(() => {
  return tokenStore.token
})
const pair = computed(() => {
  return tokenStore.pair
})
const price = computed(() => {
  return tokenStore.price
})
const priceChange = computed(() => {
  return tokenStore.priceChange || 0
})
const marketCap = computed(() => {
  return tokenStore.marketCap || 0
})

const volume24 = computed(() => {
  // console.log('-------tokenInfoExtra---------', tokenStore.tokenInfoExtra)
  return tokenStore.tokenInfoExtra?.volume_24 || 0
})
// const tokenInfo = computed(() => {
//   return tokenStore.tokenInfo || 0
// })
// console.log('-------tokenInfo---------', tokenInfo)
// console.log('-------token---------', token)
onMounted(() => {
  if (botStore?.evmAddress) {
     getTokenFavoriteCheck()
  }
})
const collected = shallowRef(false)
const loading = shallowRef(false)

function getTokenFavoriteCheck() {
  getFavoriteCheck(id, botStore.evmAddress)
    .then((res) => {
      console.log('------getFavoriteCheck---------',res, typeof res)
      collected.value = res == true ? true : false
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
    })
}

function addTokenFavorite() {
  loading.value = true
  addFavorite(id, botStore.evmAddress)
    .then(() => {
      ElMessage.success('收藏成功！')
      collected.value = true
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}
function removeTokenFavorite() {
  loading.value = true
  removeFavorite(id, botStore.evmAddress)
    .then(() => {
      ElMessage.success('已取消收藏！')
      collected.value = false
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}
function collect() {
  const address = botStore.evmAddress
  if (address) {
    if (collected.value) {
      removeTokenFavorite()
    } else {
      addTokenFavorite()
    }
  } else {
    ElMessage.error('请链接钱包')
  }
}
</script>

<style scoped lang="scss">
.token-info {
  .token-icon {
    height: 40px;
    width: 40px;
  }
  .icon-symbol {
    width: 20px;
    position: absolute;
    bottom: 3px;
    right: 0px;
  }
}
</style>
