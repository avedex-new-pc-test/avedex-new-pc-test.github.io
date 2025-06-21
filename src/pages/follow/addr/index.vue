<template>
  <div class="w-address mt-12px">
    <div class="m-header flex-between px-12px">
      <Groups v-model="conditions.group" :options="addressGroups" @onConfirm="handleConfirmEdit" @onDelete="handleDelGroup"/>
      <!-- <div ref="buttonRef">
        2334
      </div> -->
    </div>
    <div claas="m-table" />
   
  </div>

</template>

<script setup lang="ts">
import Groups from '../components/groups.vue'
import { getFavoriteList2, getAttentionPageList, getUserFavoriteGroups2, changeFavoriteGroupName2 } from '~/api/attention'
const { mode, lang, isDark } = storeToRefs(useGlobalStore())
const followStore = useFollowStore()
const { t } = useI18n()
const { addressGroups } = storeToRefs(useFollowStore())
// const addressGroups = ref([{ "group_id": 3763, "name": "base", "show_index": -1 }, { "group_id": 37632, "name": "base1", "show_index": 0 }, { "group_id": 37631, "name": "base2", "show_index": 1 }])

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
async function handleConfirmEdit(currentEditGroup: number, remark:string) {
  // 处理重命名逻辑
  changeFavoriteGroupName2(remark, currentEditGroup).then(() => {
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

</style>
