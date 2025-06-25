import {useStorage, useThrottleFn, useWindowSize} from '@vueuse/core'

export const useSignalStore = defineStore('signalStore', () => {
  const signalVisible = useStorage('signalVisible', false)
  const signalBoundingRect = useStorage('signalBoundingRect', {
    width: 360,
    height: 200,
    x: 100,
    y: 100
  })
  // const isLeftFixed = computed(() => {
  //   return signalBoundingRect.value.x <= 0
  // })
  const {width: winWidth, height: winHeight} = useWindowSize()
  const isLeftFixed = useStorage('isSignalLeft', false)
  const isRightFixed = useStorage('isSignalRight', false)
  const fixedWidth = useStorage('signalFixedWidth', 360)
  // watch(() => [winWidth.value, signalBoundingRect.value.width, signalBoundingRect.value.x], () => {
  //   if (!isRightFixed.value) {
  //     const {width, x} = signalBoundingRect.value
  //     isRightFixed.value = x + width >= winWidth.value
  //   } else {
  //     isRightFixed.value = signalBoundingRect.value.x + fixedWidth.value >= winWidth.value
  //   }
  // })

  function onDragStop(x: number, y: number) {
    signalBoundingRect.value.x = x
    signalBoundingRect.value.y = y
    isLeftFixed.value = x <= 0
    if (x > 0) {
      isRightFixed.value = x + signalBoundingRect.value.width >= winWidth.value
    }
  }

  const translateStyle = shallowRef('')
  const onDrag = useThrottleFn((x: number) => {
    if (x <= 0) {
      translateStyle.value = 'translate-x-12px'
    } else {
      translateStyle.value =
        x + signalBoundingRect.value.width >= winWidth.value ? 'translate-x--12px' : ''
    }
  }, 100, true, true)

  function onResizing(width: number, height: number) {
    signalBoundingRect.value.width = width
    signalBoundingRect.value.height = height
  }

  function onLeftDragStop(x: number) {
    isLeftFixed.value = Math.abs(x) < 1
  }

  function onRightDragStop(x: number) {
    isRightFixed.value = Math.abs(x) < 1
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
    onLeftDragStop,
    onRightDragStop,
    onResizing,
    onFixedResizing,
    onDrag,
    translateStyle
  }
})
