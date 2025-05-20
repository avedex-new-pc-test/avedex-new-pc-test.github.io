<template>
  <div class="info flex items-center bg-[--d-111-l-FFF] mb-4px h-64px p-x-16px">
    <Icon
      name="material-symbols:kid-star"
      class="color-#696E7C h-16px w-16px"
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
            >
          </template>
          <template #placeholder>
            <img
              class="token-icon"
              :src="getChainDefaultIcon(token?.chain, token?.symbol)"
            >
          </template>
        </el-image>
        <img
          v-if="token?.chain"
          class="icon-symbol rounded-100%"
          :src="`${token_logo_url}chain/${token?.chain}.png`"
        >
      </div>
      <div class="ml-8px">
        <div>
          <span
            class="text-16px leading-[1.25] color-[--d-F5F5F5-l-333] font-500"
            >{{ token?.symbol }}</span
          >
          <span class="ml-8px text-12px font-500">{{
            token?.name
          }}</span>
        </div>
        <div>
          <a
            v-if="
              token?.token !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
            "
            class="text-12px font-500 hover:color-[--d-F5F5F5-l-333]"
            :href="formatExplorerUrl(token?.chain as string, token?.token as string)"
            target="_blank"
          >
            {{
              token?.token?.replace(
                new RegExp('(.{4})(.+)(.{4}$)'),
                '$1...$3'
              )
            }}
          </a>
          <Icon v-copy="token?.token" name="bxs:copy" class="ml-5px clickable text-12px" />
          <span v-tooltip="pair?.created_at">{{ pair?.created_at }}</span>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSymbolDefaultIcon, getChainDefaultIcon ,formatExplorerUrl} from '@/utils/index'
const { token_logo_url } = useConfigStore()
const tokenStore = useTokenStore()

const token = computed(() => {
  return tokenStore.token
})
const pair = computed(() => {
  return tokenStore.pair
})
console.log('-------pair---------', pair)
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
