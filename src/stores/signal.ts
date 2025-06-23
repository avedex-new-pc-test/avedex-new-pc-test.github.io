import {useStorage, useWindowSize} from '@vueuse/core'

export const useSignalStore = defineStore('signalStore', () => {
  const signalVisible = useStorage('signalVisible', false)
  const signalBoundingRect = useStorage('signalBoundingRect', {
    width: 360,
    height: 200,
    x: 100,
    y: 100
  })
  const isLeftFixed = computed(() => {
    return signalBoundingRect.value.x <= 0
  })
  const {width: winWidth, height: winHeight} = useWindowSize()
  const isRightFixed = shallowRef(false)
  const fixedWidth = useStorage('signalFixedWidth', 360)
  watch(() => [winWidth.value, signalBoundingRect.value.width, signalBoundingRect.value.x], () => {
    if (!isRightFixed.value) {
      const {width, x} = signalBoundingRect.value
      isRightFixed.value = x + width >= winWidth.value
    } else {
      isRightFixed.value = signalBoundingRect.value.x + fixedWidth.value >= winWidth.value
    }
  })

  function onDragStop(x: number, y: number) {
    signalBoundingRect.value.x = x
    signalBoundingRect.value.y = y
  }

  function onResizing(width: number, height: number) {
    signalBoundingRect.value.width = width
    signalBoundingRect.value.height = height
  }

  function onResetPosition() {
    signalBoundingRect.value.x = 100
  }

  function onFixedResizing(width: number) {
    fixedWidth.value = width
  }

  return {
    signalVisible,
    signalBoundingRect,
    isLeftFixed,
    isRightFixed,
    fixedWidth,
    winHeight,
    winWidth,
    onDragStop,
    onResetPosition,
    onResizing,
    onFixedResizing,
  }
})
