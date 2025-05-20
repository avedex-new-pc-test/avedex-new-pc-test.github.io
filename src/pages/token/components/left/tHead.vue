<script setup lang="ts">
const props = defineProps({
  columns: {
    type: Array<{ label: string, value: string }>,
    default: () => []
  },
  sort: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update:sort'])

function getActiveClass(activeSort: number, sortBy: string, direction: string) {
  const isEqual = props.sort.activeSort === activeSort && props.sort.sortBy === sortBy
  if (direction === 't') {
    return isEqual
      ? 'border-t-[--d-F5F5F5-l-333]'
      : 'border-t-[--d-999-l-666]'
  }
  return isEqual
    ? 'border-b-[--d-F5F5F5-l-333]'
    : 'border-b-[--d-999-l-666]'
}

const statusTo = {
  0: -1,
  1: 0,
  '-1': 1
}
function switchSort(sortBy: string, activeSort?: number) {
  const sort = {...props.sort}
  if (!activeSort) {
    if (sort.sortBy !== sortBy) {
      sort.activeSort = -1
    } else {
      sort.activeSort = statusTo[sort.activeSort]
    }
  } else {
    sort.activeSort = activeSort
  }
  sort.sortBy = sortBy
  emit('update:sort', sort)
}
</script>

<template>
  <div
    class="flex justify-between items-center p-10px text-12px color-[--d-999-l-666]"
  >
    <div
      v-for="(column, i) in columns"
      :key="i"
      :class="`flex items-center cursor-pointer ${column.flex}`"
      @click.stop="switchSort(column.value)">
      {{ column.label }}
      <div v-if="column.sort" class="flex flex-col items-center justify-center ml-5px">
        <i
          :class="`w-0 h-0 border-solid border-4px border-transparent cursor-pointer
            ${getActiveClass(-1,column.value,'b') }
            `"
          @click.stop="switchSort(column.value, -1)"
        />
        <i
          :class="`w-0 h-0 border-solid border-4px border-transparent mt-3px cursor-pointer
            ${getActiveClass(1,column.value,'t') }
            `"
          @click.stop="switchSort(column.value, 1)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
