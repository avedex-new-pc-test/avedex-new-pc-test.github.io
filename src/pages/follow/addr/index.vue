<template>
  <div class="w-address mt-12px">
    <div class="m-header flex-between px-12px">
      <ul class="w-tabs">
        <li class="clickable" :class="{ active: conditions.group === 0 }" @click.stop.prevent="conditions.group = 0">
          <span>{{ $t('defaultGroup') }}</span>
        </li>
        <li v-for="item in addressGroups" :key="item.group_id" class="clickable flex gap-2px"
          :class="{ active: conditions.group === item.group_id, 'px-0px!': edits[item.group_id] }"
          @click.stop.prevent="conditions.group = item.group_id">
          <el-input v-if="edits[item.group_id]" v-model="remark" style="width: 140px" size="default"
            class="remark-input">
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
              @click.stop.prevent="buttonRef = $refs.buttonRefs[item.group_id]; visible = true; currentEditGroup = item.group_id; remark = item.name"
              v-click-outside="() => visible = false" />
          </template>
        </li>
        <li class="clickable color-#3F80F7! flex gap-2px">
          <Icon name="material-symbols:add-circle" class="text-12px" />
          <span>{{ $t('newGroup') }}</span>
        </li>
        <li class="clickable color-#3F80F7! flex gap-2px">
          <Icon name="material-symbols:format-list-bulleted" class="text-12px" />
          <span>{{ $t('groupManage') }}</span>
        </li>
      </ul>
      <!-- <div ref="buttonRef">
        2334
      </div> -->
    </div>
    <div claas="m-table" />
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
  </div>

</template>

<script setup lang="ts">
import { init } from 'echarts'
import { getFavoriteList2, getAttentionPageList, getUserFavoriteGroups2, changeFavoriteGroupName2 } from '~/api/attention'
import { ref, unref } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
const { mode, lang, isDark } = storeToRefs(useGlobalStore())
const followStore = useFollowStore()
const { t } = useI18n()
const { addressGroups } = storeToRefs(useFollowStore())
// const addressGroups = ref([{ "group_id": 3763, "name": "base", "show_index": -1 }, { "group_id": 37632, "name": "base1", "show_index": 0 }, { "group_id": 37631, "name": "base2", "show_index": 1 }])
const $refs = ref({
  buttonRefs: {} as Record<number, any>
})
const remark = ref('')
const edits = ref<Record<number, boolean>>({})
const currentEditGroup = ref()
const visible = ref(false)
const buttonRef = ref()
const popoverRef = ref()
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}
const conditions = reactive({
  group: 0
})
onMounted(async () => {
  init()
})
function init() {
  getUserFavoriteGroups()
}
async function getUserFavoriteGroups() {
  // let data=[]
  // try {
  //  const res =await getUserFavoriteGroups2()
  // }catch (e) {
  //   console.log('=>(favoriteTable.vue:19) e', e)
  // }
}
function handleRenameGroup() {
  // visible.value = false
  // 处理重命名逻辑
  edits.value[currentEditGroup.value] = true
  nextTick(() => {
    (document.querySelector('.remark-input input') as HTMLInputElement | null)?.focus()
  })
  console.log('重命名分组')
}
function handleCancelEdit() {
  edits.value[currentEditGroup.value] = false
}
async function handleConfirmEdit() {
  edits.value[currentEditGroup.value] = false
  // 处理重命名逻辑
  changeFavoriteGroupName2(remark.value, currentEditGroup.value).then(() => {
    followStore.getUserFavoriteGroups2()
  }).catch((e) => {
     ElMessage.error(String(e))
  })
}
function handleDelGroup() {
  // visible.value = false
  // 处理删除逻辑
  console.log('删除分组')
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
