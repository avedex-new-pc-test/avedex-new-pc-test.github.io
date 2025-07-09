<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  filterParams: {
    token: string
    history_count: undefined | number
    mc_curr: undefined | number
    mc_curr_sign: string
  }
}>()
const emit = defineEmits(['update:modelValue', 'update:filterParams', 'onConfirm', 'onReset'])
const shouldAlert = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
const tempFilterParams = ref({
  token: '',
  history_count: undefined as undefined | number,
  mc_curr: undefined as undefined | number,
  mc_curr_sign: '<'
})

const filterVisible = shallowRef(false)
watch(filterVisible, val => {
  if (val) {
    tempFilterParams.value = {...props.filterParams}
  }
})
const mcOptions = shallowRef([
  {label: '<$500K', value: 5e5},
  {label: '<$1M', value: 1e6},
  {label: '<$10M', value: 1e7},
])
const themeStore = useThemeStore()
</script>

<template>
  <div class="flex items-center color-[--d-999-l-666]">
    <el-popover
      v-model:visible="filterVisible"
      placement="bottom-end"
      trigger="click"
      :width="308"
    >
      <template #reference>
        <Icon
          id="custom-filter"
          name="custom:filter"
          class="mr-8px text-12px cursor-pointer"
        />
      </template>
      <template #default>
        <div class="mb-12px text-16px color-[--d-F5F5F5-l-333]">
          {{ $t('filter') }}
        </div>
        <div class="mb-16px flex flex-col gap-8px text-12px">
          <label class="color-[--d-999-l-666]">{{ $t('TokenAddress') }}</label>
          <el-input
            v-model="tempFilterParams.token"
            size="large"
            clearable
            :placeholder="$t('searchPlaceholder')"
            class="[&&]:[--el-input-bg-color:--d-333-l-F2F2F2] [&&]:[--el-input-border-color:transparent] [&&]:[--el-input-hover-border-color:--primary-color] [&&]:text-12px"
          />
        </div>
        <div class="mb-16px flex flex-col gap-8px text-12px">
          <label class="color-[--d-999-l-666]">{{ $t('SignalCount') }}</label>
          <div class="flex gap-8px">
            <div
              v-for="item in [2,5,15]"
              :key="item"
              class="flex-1 cursor-pointer h-32px bg-[--d-333-l-F2F2F2] border-solid border-1px border-[--d-222-l-F2F2F2] text-12px color-[--d-F5F5F5-l-333] flex items-center justify-center rounded-4px"
              :class="{
                'color-#3f80f7 border-color-#3f80f7':tempFilterParams.history_count === item
              }"
              @click="()=>{
                if(tempFilterParams.history_count !== item){
                  tempFilterParams.history_count = item
                } else {
                  tempFilterParams.history_count = undefined
                }
              }"
            >
              >{{ item }}
            </div>
          </div>
        </div>
        <div class="mb-16px flex flex-col gap-8px text-12px">
          <label class="color-[--d-999-l-666]">{{ $t('CurrentMC') }}</label>
          <div class="flex gap-8px">
            <div
              v-for="(item,idx) in mcOptions"
              :key="idx"
              class="flex-1 cursor-pointer h-32px bg-[--d-333-l-F2F2F2] border-solid border-1px border-[--d-222-l-F2F2F2] text-12px color-[--d-F5F5F5-l-333] flex items-center justify-center rounded-4px"
              :class="{
                'color-#3f80f7 border-color-#3f80f7':tempFilterParams.mc_curr === item.value
              }"
              @click="()=>{
                if(tempFilterParams.mc_curr !== item.value){
                  tempFilterParams.mc_curr = item.value
                } else {
                  tempFilterParams.mc_curr = undefined
                }
              }"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="flex">
          <el-button
            class="h-32px flex-1 m-l-auto"
            :color="themeStore.isDark ? '#333':'#F2F2F2'"
            @click="filterVisible=false;emit('onReset')"
          >
            {{ $t('reset') }}
          </el-button>
          <el-button
            type="primary"
            class="h-32px flex-1 m-l-auto"
            @click="filterVisible=false;emit('onConfirm',tempFilterParams)"
          >
            {{ $t('confirm') }}
          </el-button>
        </div>
      </template>
    </el-popover>
    <Icon
      name="icon-park-solid:volume-notice"
      class="mr-4px"
    />
    <el-switch
      v-model="shouldAlert"
      size="small"
      active-value="1"
      inactive-value="0"/>
  </div>
</template>

<style scoped lang="scss">

</style>
