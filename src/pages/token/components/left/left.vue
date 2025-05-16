<script setup lang="ts">
import TopLeftTable from './topLeftTable.vue'
import {useWindowSize, useStorage} from '@vueuse/core'
import BottomLeftTable from '~/pages/token/components/left/bottomLeftTable.vue'

const topLeftHeight = useStorage('topLeftHeight', 479)
const canDrag = shallowRef(false)
const {height} = useWindowSize()

function drag(e: MouseEvent) {
  let dy = e.clientY
  canDrag.value = true
  document.onmousemove = e => {
    if (!canDrag.value) {
      return
    }
    if (e.clientY > height.value) {
      canDrag.value = false
      return
    }
    // document.getElementById('k-line-chart-container').style.pointerEvents = 'none'
    if (e.clientY < dy) {
      topLeftHeight.value -= dy - e.clientY
    } else {
      topLeftHeight.value += e.clientY - dy
    }
    dy = e.clientY
  }
  document.onmouseup = () => {
    // document.getElementById('k-line-chart-container').style.pointerEvents = 'auto'
    canDrag.value = false
    document.onmousemove = null
    document.onmouseup = null
  }
  return false
}
</script>

<template>
  <div class="h-full">
    <div class="relative">
      <TopLeftTable :height="topLeftHeight"/>
      <div
          class="absolute bottom-0 left-0 cursor-row-resize w-full
      py-2px bg-[--d-000-l-F6F6F6]
    " @mousedown.stop.prevent="drag"/>
    </div>
    <BottomLeftTable :topLeftHeight="topLeftHeight"/>
  </div>
</template>

<style scoped>

</style>
