<script setup lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'
import {useThrottleFn} from '@vueuse/core'

defineProps<{
  initialWidth: number
  initialHeight?: number
  minWidth: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  parent?: boolean
  handles: string[]
}>()

const emit = defineEmits(['onDragStop', 'onResizing'])
const klineRef = shallowRef<HTMLElement | null>(null)
onMounted(() => {
  setTimeout(() => {
    klineRef.value = document.getElementById('tv_chart_container')!
  }, 20)
})

function onDragStop(x: number, y: number) {
  emit('onDragStop', x, y)
}

const onResizing = useThrottleFn((...args: number[]) => {
  klineRef.value!.style.pointerEvents = 'none'
  emit('onResizing', args[2], args[3])
}, 100, true, true)

function onResizeStop() {
  klineRef.value!.style.pointerEvents = 'auto'
}
</script>

<template>
  <VueDraggableResizable
    class-name-dragging="opacity-90 z-10!"
    :w="initialWidth"
    :h="initialHeight"
    :min-width="minWidth"
    :min-height="minHeight"
    :maxWidth="maxWidth"
    :maxHeight="maxHeight"
    :parent="parent"
    :handles="handles"
    @drag-stop="onDragStop"
    @resizing="onResizing"
    @resizeStop="onResizeStop"
  >
    <slot/>
  </VueDraggableResizable>
</template>

<style lang="scss">
@import "vue-draggable-resizable/style.css";

.handle {
  display: block !important;
}

.handle-tl, .handle-tr, .handle-br, .handle-bl {
  opacity: 0;
}
.handle-mr, .handle-ml {
  z-index: 1;
  opacity: 0;
  margin-top: 0;
  top: 0;
  height: 100%;
  user-select: none;
  cursor: col-resize;
}

.handle-mr {
  right: -2px;
}

.handle-ml {
  left: -2px;
}

.handle-tm, .handle-bm {
  z-index: 1;
  opacity: 0;
  margin-left: 0;
  left: 0;
  width: 100%;
  user-select: none;
  cursor: row-resize;
}

.handle-bm {
  z-index: 1;
  bottom: -8px;
}

.handle-tm {
  top: -8px;
}
</style>
