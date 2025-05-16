<template>
  <slot v-bind="timerContext">
    <span>{{ timerContext.formatted }}</span>
  </slot>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface TimerContext {
  totalSeconds: number
  seconds: number
  formatted: string
}

const props = withDefaults(defineProps<{
  autoStart?: boolean
  startTime?: number
  timestamp?: number
  endTime?: number
  format?: string | ((totalSeconds: number) => string)
}>(), {
  autoStart: true,
  startTime: 0,
  timestamp: undefined,
  endTime: undefined,
  format: 'HH:mm:ss',
})

const emit = defineEmits<{
  (e: 'update:seconds', seconds: number): void
}>()

// 起始时间（毫秒）
const now = Date.now()
const startTimeMs = computed(() => {
  if (props.timestamp !== undefined) {
    return now - props.timestamp * 1000
  }
  return (props.startTime ?? 0) * 1000
})

const endTimeMs = props.endTime !== undefined ? props.endTime * 1000 : undefined

const elapsedTimeMs = ref(startTimeMs.value)
const startTimestamp = ref(0)
const isRunning = ref(false)
let rafId: ReturnType<typeof requestAnimationFrame> | null = null
let lastSecond = -1

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0')
}

function formatWithTemplate(ms: number, template: string): string {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const replaceMap: Record<string, string | number> = {
    'DD': pad(days),
    'D': days,
    'HH': pad(hours),
    'H': hours,
    'mm': pad(minutes),
    'm': minutes,
    'ss': pad(seconds),
    's': seconds,
  }

  return template.replace(/DD|D|HH|H|mm|m|ss|s/g, (match) => String(replaceMap[match]))
}

const timerContext = computed<TimerContext>(() => {
  const ms = elapsedTimeMs.value
  const totalSeconds = ms / 1000
  const seconds = Math.floor(totalSeconds)

  let formatted = ''
  if (typeof props.format === 'function') {
    formatted = props.format(totalSeconds)
  } else if (typeof props.format === 'string') {
    formatted = formatWithTemplate(ms, props.format)
  } else {
    formatted = formatWithTemplate(ms, 'HH:mm:ss')
  }

  return {
    totalSeconds,
    seconds,
    formatted,
  }
})

function start() {
  if (isRunning.value) return

  isRunning.value = true
  startTimestamp.value = Date.now() - elapsedTimeMs.value
  lastSecond = timerContext.value.seconds

  const update = () => {
    if (!isRunning.value) return

    const now = Date.now()
    elapsedTimeMs.value = now - startTimestamp.value

    if (endTimeMs !== undefined && elapsedTimeMs.value >= endTimeMs) {
      elapsedTimeMs.value = endTimeMs
      emit('update:seconds', timerContext.value.seconds)
      stop()
      return
    }

    const currentSecond = timerContext.value.seconds
    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond
      emit('update:seconds', currentSecond)
    }

    rafId = requestAnimationFrame(update)
  }

  update()
}

function stop() {
  isRunning.value = false
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function reset() {
  stop()
  elapsedTimeMs.value = startTimeMs.value
  lastSecond = -1
  emit('update:seconds', timerContext.value.seconds)
}

defineExpose({ start, stop, reset })

onMounted(() => {
  if (props.autoStart) start()
})

onUnmounted(stop)
</script>
