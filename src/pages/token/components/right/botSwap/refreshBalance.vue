<template>
  <VLoading v-if="loading" class="ml-5px text-14px" />
  <Icon
    v-else
    name="custom:refresh-left"
    class="ml-5px clickable text-14px"
    @click.stop="refreshTokenBalance"
  />
</template>

<script lang="ts" setup>
import { useBotSwap } from '~/composables/botSwap'
interface Props {
  type: number
}

const props = defineProps<Props>()

const { loading, refreshTokenBalance } = useBotSwap(props.type)


</script>
