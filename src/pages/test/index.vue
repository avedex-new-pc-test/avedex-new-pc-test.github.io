<template>
  <div
      :style="{
    position: 'relative',
    width:'500px',
    height: '500px',
    border: '1px solid blue',
    margin: '1em',
  }"
  >
    <Draggable
        v-if="!isLeftFixed"
        :initialWidth="250"
        :initial-height="250"
        :min-width="320"
        :min-height="200"
        :parent="true"
        :handles="[
          'mr',
          'bm',
          'ml',
          'tm',
    ]"
        @leftFixed="leftFixed"
    >
      <p>You cannot move me or resize me outside my parent element.</p>
    </Draggable>
    <Draggable
        v-else
        :initial-width="250"
        :initial-height="500"
        :min-width="320"
        :handles="['mr', 'ml']"
        :parent="true"
        @leftFixed="leftFixed"
    >

    </Draggable>
  </div>
</template>
<script setup lang="ts">
const isLeftFixed = shallowRef(false)

function leftFixed(flag: boolean) {
  isLeftFixed.value = flag
}
</script>
