<script setup lang="ts">
import TopLeftTable from './topLeftTable.vue'
import BottomLeftTable from '~/pages/token/components/left/bottomLeftTable.vue'

const topLeftHeight = shallowRef(370)
const canDrag = shallowRef(false)
const globalStore = useGlobalStore()

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
  }
  return false
}
</script>

<template>
  <div v-show="globalStore.showLeft">
    <div class="relative">
      <TopLeftTable :height="topLeftHeight"/>
      <div
        class="w-full cursor-row-resize bg-[--d-2D3037-l-F5F5F5] flex items-center justify-center h-6px"
        @mousedown.stop.prevent="drag"
      >
        <Icon name="custom:drag" class="text-4px color-#959A9F"/>
      </div>
    </div>
    <BottomLeftTable/>
  </div>
</template>

<style scoped>

</style>
