<template>
  <ul class="w-tabs">
    <li class="clickable" :class="{ active: props.modelValue === 0 }" @click.stop.prevent="emit('update:modelValue', 0)">
      <span>{{ $t('defaultGroup') }}</span>
    </li>
    <li v-for="item in props.options" :key="item.group_id" class="clickable flex gap-2px"
      :class="{ active: props.modelValue === item.group_id, 'px-0px!': edits[item.group_id] }"
      @click.stop.prevent="emit('update:modelValue', item.group_id)">
      <el-input v-if="edits[item.group_id]" v-model="name" style="width: 140px" size="default"
        class="name-input">
        <template #suffix>
          <Icon name="mynaui:x-square-solid" class="text-18px color-[var(--d-F5F5F5-l-222)] clickable"
            @click.stop.prevent="handleCancelEdit" />
          <!-- <Icon v-else name="mynaui:x-square" class="text-18px color-#666"/> -->
          <Icon name="mynaui:check-square-solid" class="text-18px color-[var(--d-F5F5F5-l-222)] clickable"
            @click.stop.prevent="handleConfirmEdit" />
          <!-- <Icon v-else name="mynaui:check-square" class="text-18px color-#666"/> -->
        </template>
      </el-input>
      <template v-else>
        <span>{{ item.name }}</span>
        <Icon :ref="(el: EventTarget) => $refs.buttonRefs[item.group_id] = el" name="mdi:dots-vertical"
          class="text-14px"
          @click.stop.prevent="buttonRef = $refs.buttonRefs[item.group_id]; visible = true; currentEditGroup = item.group_id; name = item.name"
          v-click-outside="() => visible = false" />
      </template>
    </li>
    <li class="clickable color-#3F80F7! flex gap-2px" @click.stop.prevent="handleAddGroup">
      <Icon name="material-symbols:add-circle" class="text-12px" />
      <span>{{ $t('newGroup') }}</span>
    </li>
    <li class="clickable color-#3F80F7! flex gap-2px" @click.stop.prevent="openSetting">
      <Icon name="material-symbols:format-list-bulleted" class="text-12px" />
      <span>{{ $t('groupManage') }}</span>
    </li>
  </ul>
  <el-popover ref="popoverRef" :visible="visible" :virtual-ref="buttonRef" trigger="click" title="" virtual-triggering
    popper-style="width: 86px;min-width: 86px;">
    <ul>
      <li class="font-500 text-14px lh-[100%] tracking-0px  mb-20px flex-start gap-4px clickable"
        @click.stop.prevent="handleRenameGroup">
        <Icon name="fe:edit" class="color-#666 text-14px mt-3px" />
        <span>重命名</span>
      </li>
      <li class="font-500 text-14px lh-[100%] tracking-0px clickable flex-start gap-4px"
        @click.stop.prevent="handleDelGroup">
        <Icon name="bx:bxs-trash-alt" class="text-15px color-#666 mt-3px" />
        <span>删除</span>
      </li>
    </ul>
  </el-popover>
</template>

<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus'
const emit = defineEmits<{
  (e: 'onConfirm', groupId: number, name: string): void
  (e: 'onDelete' | 'onCancel' | 'update:modelValue', groupId: number): void
  (e: 'onChangeIndex', groupId: number, groupId2: number): void
  (e: 'onAdd', name: string): void
}>()
const props = defineProps({
  options: {
    type: Array as PropType<Array<{ group_id: number; name: string; show_index: number }>>,
    default: () => []
  },
  modelValue: {
    type: Number,
    default: 0
  }
})

const $refs = ref({
  buttonRefs: {} as Record<number, any>
})
const name = ref('')
const edits = ref<Record<number, boolean>>({})
const currentEditGroup = ref()
const visible = ref(false)
const buttonRef = ref()
const popoverRef = ref()

function handleRenameGroup() {
  edits.value[currentEditGroup.value] = true
  nextTick(() => {
    (document.querySelector('.name-input input') as HTMLInputElement | null)?.focus()
  })
}
function handleCancelEdit() {
  edits.value[currentEditGroup.value] = false
  emit('onCancel', currentEditGroup.value)
}
function handleConfirmEdit() {
  edits.value[currentEditGroup.value] = false
  emit('onConfirm', currentEditGroup.value, name.value)
}
function handleDelGroup() {
  emit('onDelete', currentEditGroup.value)
}
function handleAddGroup() {
  emit('onAdd',name.value)
}
function openSetting() {
  emit('onChangeIndex',1,2)
}
</script>

<style scoped lang="scss">
ul.w-tabs {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 12px;

  /* border-bottom: 1px solid var(--d-222-l-EEE); */
  li {
    display: flex;
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    background-color: var(--d-1A1A1A-l-F2F2F2);
    justify-content: center;
    align-items: center;
    color: #666;
    border-radius: 4px;

    &.active {
      color: #f5f5f5;
      background-color: var(--d-333-l-0A0B0C);
    }
  }
}
</style>

