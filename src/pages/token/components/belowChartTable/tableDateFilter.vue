<script setup lang="ts">
const {isDark} = useThemeStore()
const props = defineProps({
  visible: Boolean,
  modelValue: {
    type: Array<string>,
    default: () => []
  }
})
const emit = defineEmits(['update:visible', 'update:modelValue', 'confirm', 'reset'])
const computedVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emit('update:visible', val)
  }
})
const filterTime = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <el-popover
    v-model:visible="computedVisible"
    placement="bottom"
    :width="420"
    trigger="click"
    :teleported="false"
    popper-style="max-width: 420px"
  >
    <template #reference>
      <Icon
        name="custom:filter"
        :class="`${modelValue?'color-[--d-F5F5F5-l-222]':'color-[--d-666-l-999]'} cursor-pointer`"
      />
    </template>
    <template #default>
      <div class="text-14px font-400 color-[--d-F5F5F5-l-222]">
        {{ $t('filterTime') }}
      </div>
      <div class="mt-10px flex color-[--d-999-l-666]">
        <span class="flex-[1.2]">{{ $t('startTime') }}</span>
        <span class="flex-1">{{ $t('endTime1') }}</span>
      </div>
      <el-date-picker
        v-model="filterTime"
        class="mt-5px"
        type="datetimerange"
        range-separator="To"
        start-placeholder="yyyy/mm/dd hh:mm:ss"
        end-placeholder="yyyy/mm/dd hh:mm:ss"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="X"
        prefix-icon="Calendar"
        :teleported="false"
        @calendar-change="console.log"
      />
      <div class="flex mt-20px">
        <el-button
          class="h-30px flex-1 m-l-auto"
          :color="isDark ? '#333':'#F2F2F2'"
          @click="emit('reset')"
        >
          {{ $t('reset') }}
        </el-button>
        <el-button
          class="h-30px flex-1 m-l-auto"
          :color="isDark ? '#F5F5F5':'#222'"
          @click="emit('confirm')"
        >
          {{ $t('confirm') }}
        </el-button>
      </div>
    </template>
  </el-popover>
</template>

<style scoped>

</style>
