import {useThrottleFn} from '@vueuse/core'

export default function useDrag() {
  const x = ref(100)
  const y = ref(100)
  const dragging = ref(false)
  let offsetX = 0
  let offsetY = 0

  function onMouseDown(e: MouseEvent) {
    dragging.value = true
    offsetX = e.clientX - x.value
    offsetY = e.clientY - y.value
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = useThrottleFn(function onMouseMove(e) {
    if (!dragging.value) return
    x.value = e.clientX - offsetX
    y.value = e.clientY - offsetY
  }, 16)

  function onMouseUp() {
    dragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  return {
    onMouseDown,
    onMouseUp
  }
}
