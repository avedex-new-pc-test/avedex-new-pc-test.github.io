<template>
  <div class="w-address mt-12px">
    <div class="m-header flex-between px-12px items-start">
      <pro-groups v-model="conditions.group" :options="addressGroups" @onConfirm="handleConfirmEdit" @onDelete="handleDelGroup" @onAdd="handleAddGroup"/>
      <ul class="w-operate">
        <li>
           <el-checkbox v-model="conditions.isMonitor" :label="t('monitorList')" size="small" style="font-size: 12px;color:var(--d-666-l-333)" />
        </li>
        <li class="btn">
          <span>{{ $t('bulkProcess') }}</span>
        </li>
        <li>
          <el-radio-group v-model="conditions.activeTab" class="m-radio-group" size="small" :fill="isDark?'#333':'#666'" :text-color="isDark?'#F5F5F5':'#FFF'" @change="()=>{}">
            <el-radio-button label="7D" :value="'7d'" />
            <el-radio-button label="1M" :value="'30d'" />
          </el-radio-group>
        </li>
      </ul>
    </div>
    <div claas="m-table" />
  </div>

</template>

<script setup lang="ts">
import ProGroups from '../components/proGroups.vue'
import { getFavoriteList2, getAttentionPageList, getUserFavoriteGroups2, changeFavoriteGroupName2 ,addFavoriteGroup2,removeFavoriteGroup2} from '~/api/attention'
const { mode, lang, isDark } = storeToRefs(useGlobalStore())
const followStore = useFollowStore()
const { t } = useI18n()
const { addressGroups } = storeToRefs(useFollowStore())
// const addressGroups = ref([{ "group_id": 3763, "name": "base", "show_index": -1 }, { "group_id": 37632, "name": "base1", "show_index": 0 }, { "group_id": 37631, "name": "base2", "show_index": 1 }])

const conditions = reactive({
  group: 0,
  activeTab: '7d',
  isMonitor: false
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
function handleConfirmEdit(currentEditGroup: number, remark:string) {
  changeFavoriteGroupName2(remark, currentEditGroup).then(() => {
    ElMessage.success(t('success'))
    followStore.getUserFavoriteGroups2()
  }).catch((e) => {
     ElMessage.error(String(e))
  })
}
function handleAddGroup(name:string) {
   addFavoriteGroup2(name).then(() => {
    ElMessage.success(t('success'))
    followStore.getUserFavoriteGroups2()
  }).catch((e) => {
     ElMessage.error(String(e))
  })
}
function handleDelGroup(groupId: number) {
  // visible.value = false
  // 处理删除逻辑
  console.log('删除分组')
  ElMessageBox.confirm(t('removeFavGroupTips2'), t('tips'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    dangerouslyUseHTMLString: true,
    customClass: '',
  }).then(()=>{
    removeFavoriteGroup2(groupId).then(() => {
      ElMessage.success(t('success'))
      followStore.getUserFavoriteGroups2()
    }).catch((e) => {
       ElMessage.error(String(e))
    })
  })
}
</script>

<style scoped lang="scss">
.w-operate{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 12px;
  /* border-bottom: 1px solid var(--d-222-l-EEE); */
  li.btn {
    display: flex;
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    background-color: var(--d-222-l-F2F2F2);
    justify-content: center;
    align-items: center;
    color: var(--d-999-l-666);
    border-radius: 4px;

    &.active {
      color: #f5f5f5;
      background-color: var(--d-333-l-0A0B0C);
    }
  }
}
</style>
