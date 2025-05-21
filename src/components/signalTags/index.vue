<template>
  <div
      v-if="newTags?.length > 0"
      class="flex cursor-pointer"
      @mouseover.stop="onEnter"
      @mouseleave.stop="onLeave">
    <template v-for="(i, index) in newTags" :key="index">
      <img
          v-if="i.type?.includes('TOP') && i.type?.slice(3) <25 || Number(i.type)"
          style="pointer-events: none;"
          :class="tagClass" :src="formatNewTags(i.icon)" alt=""
          height="15">
    </template>
  </div>
</template>
<script setup lang="ts">
import TagsContent from './tagsContent'
import {formatNewTags} from '~/utils'

const {$tooltip} = useNuxtApp()
const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  tagClass: {
    type: String,
    default: 'ml-3px'
  },
  walletAddress: {
    type: String,
    default: ''
  },
  chain: {
    type: String,
    default: ''
  }
})
const {getPublicPortrait} = usePublicPortraitStore()
const newTags = computed(() => {
  if (!props.walletAddress || !props.chain) return props.tags
  const wsTags = getPublicPortrait(props.walletAddress, props.chain)?.new_tags || []
  const tags = wsTags?.length > 0 ? wsTags : props.tags
  return tags || []
})

function onEnter(e) {
  if (!newTags.value.some(i => Number(i.type))) {
    return
  }
  $tooltip.show({
    content: {
      is: TagsContent,
      props: {
        tags: newTags.value
      }
    },
    target: e.target,
    props: {
      placement: 'top',
    }
  })
}

function onLeave() {
  $tooltip.hide()
}
</script>
