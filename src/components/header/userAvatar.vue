<template>
  <div class="icon-wallet-avatar-container">
    <el-image class="icon-wallet-avatar" :src="walletLogo" width="16">
      <template #error>
        <img
          class="icon-wallet-avatar"
          :src="generateAvatarIcon(wallet_logo?.name || address)"
        >
      </template>
    </el-image>
    <img
      v-if="wallet_logo.vip_logo"
      class="icon-vip_logo"
      :src="wallet_logo.vip_logo"
      alt=""
      srcset=""
    >
    <img
      v-else-if="chain && !wallet_logo.vip_logo"
      class="icon-chain"
      :src="`${configStore.token_logo_url}chain/${chain}.png`"
      alt=""
      srcset=""
    >
  </div>
</template>
<script lang="ts" setup>
import { generateAvatarIcon } from '@/utils/index'
const configStore = useConfigStore()
const props = defineProps({
  wallet_logo: {
    type: Object,
    default: () => ({
      logo: '',
      name: '',
      url: '',
    }),
  },
  address: {
    type: String,
    default: '',
  },
  chain: {
    type: String,
    default: '',
  },
  iconSize: {
    type: String,
    default: '16px',
  },
  iconChainSize: {
    type: String,
    default: '',
  },
})
const walletLogo = computed(() => {
  return (
    props.wallet_logo?.logo?.replace?.(/_normal/, '_400x400') ||
    generateAvatarIcon(props.wallet_logo?.name || props.address)
  )
  return '11'
})
const chainSize = computed(() => {
  if (props.iconChainSize) return props.iconChainSize
  const size = Math.min(
    Number((props.iconChainSize || props.iconSize)?.replace?.('px', '') / 2) ||
      12,
    20
  )
  return size + 'px'
  return '14px'
})
</script>
<style lang="scss" scoped>
.icon-wallet-avatar-container {
  position: relative;
  // margin-right: 8px;
  display: flex;
  .icon-wallet-avatar {
    border-radius: 50%;
    height: v-bind('iconSize');
    width: v-bind('iconSize');
  }
  .icon-chain {
    height: v-bind('chainSize');
    width: v-bind('chainSize');
    border-radius: 50%;
    position: absolute;
    right: -3px;
    bottom: -1px;
    margin: 0;
  }
  .icon-vip_logo {
    height: v-bind('chainSize');
    width: v-bind('chainSize');
    border-radius: 50%;
    position: absolute;
    right: -3px;
    bottom: -1px;
    margin: 0;
  }
}
</style>
