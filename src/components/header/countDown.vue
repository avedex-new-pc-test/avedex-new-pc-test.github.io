<template>
    <div>
    1111111111
    </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useCountdown } from '@vueuse/core'

const countdown = shallowRef(5)
const { start, reset } = useCountdown(countdown, {
})

// change the countdown value
countdown.value = 10

// start a new countdown with 2 seconds
start(2)

// reset the countdown to 4, but do not start it
reset(4)

// start the countdown with the current value of `countdown`
start()
</script>

<style scoped>

</style>