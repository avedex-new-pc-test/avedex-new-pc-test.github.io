<template>
  <SlippageSet :canSetAuto="true" :chain="chain" :setting="botSettings[chain]" @onSubmit="onSubmitBotSwapSet" :key="chain">
    <template #icon>
      <slot name="icon"></slot>
    </template>
  </SlippageSet>
</template>
<script>
import SlippageSet from './slippageSet'
// import { useStorage } from '@vueuse/core'
import { useBotSetting } from '@/utils/hook.js'
export default {
  name: 'SlippageSetMarket',
  props: {
    chain: {
      type: String,
      default: ''
    }
  },
  setup() {
    const botSettings = useBotSetting()
    return {
      botSettings
    }
  },
  data() {
    return {
      // slippage: localStorage.botSlippage || '9',
    }
  },
  components: {
    SlippageSet
  },
  methods: {
    onSubmitBotSwapSet(setting) {
      if (setting?.setting) {
        // localStorage.botSlippage = setting?.slippage || '9'
        // // this.slippage = localStorage.botSlippage
        // this.$store.state.bot.slippage = localStorage.botSlippage
        if (this.chain === 'solana') {
          this.botSettings = {
            ...this.botSettings,
            solana: {...setting.setting}
          }
        } else {
          this.botSettings = {
            ...this.botSettings,
            [this.chain]: {...setting.setting}
          }
        }
      }
    },
  }
}
</script>
<style lang="scss" scoped>
:deep() .btn-set {
  color: var(--custom-text-2-color);
  position: static;
  top: initial;
  right: initial;
  transform: initial;
  margin-left: 5px;
  &:hover {
    color: var(--custom-text-1-color);
  }
}

</style>
