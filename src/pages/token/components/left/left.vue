<script setup lang="ts">
import TopLeftTable from './topLeftTable.vue'
import BottomLeftTable from '~/pages/token/components/left/bottomLeftTable.vue'
import {useEventBus, useStorage} from '@vueuse/core'
import {DefaultHeight} from '~/utils/constants'

const topLeftHeight = useStorage('topLeftHeight', DefaultHeight.TOPLEFT)
const canDrag = shallowRef(false)
const globalStore = useGlobalStore()

// const leftDragEvent = useEventBus(BusEventType.LEFT_DRAG)

function drag(e: MouseEvent) {
  let dy = e.clientY
  canDrag.value = true
  document.onmousemove = e => {
    if (!canDrag.value) {
      return
    }
    const {clientY} = e

    if (clientY < dy) {
      topLeftHeight.value -= dy - clientY
    } else {
      topLeftHeight.value += clientY - dy
    }
    dy = clientY
  }
  document.onmouseup = () => {
    // document.getElementById('k-line-chart-container').style.pointerEvents = 'auto'
    canDrag.value = false
    document.onmousemove = null
    document.onmouseup = null
    // leftDragEvent.emit(topLeftHeight.value)
  }
  return false
}
</script>

<template>
  <div v-show="globalStore.showLeft">
    <div class="relative">
      <TopLeftTable :height="topLeftHeight"/>
      <div
        class="w-full cursor-row-resize bg-[--d-222-l-F2F2F2] gap-1px hover:bg-[--d-666-l-CCC] flex items-center justify-center h-4px"
        @mousedown.stop.prevent="drag"
      >
        <span v-for="i in 4" :key="i" class="bg-#444 w-2px h-2px rounded-full"/>
      </div>
    </div>
    <BottomLeftTable/>
  </div>
</template>

<style scoped>

</style>
