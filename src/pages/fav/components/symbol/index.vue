<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { cloneDeep } from 'lodash-es'
import { VueDraggable } from 'vue-draggable-plus'
import { formatNumber2 } from '~/utils/formatNumber'
import { getChainDefaultIcon } from '~/utils'
import ArcProgress from '~/components/arcProgress.vue'
import { getNewFavoriteList, getUserFavoriteGroups, removeFavorite, removeFavoriteGroup, addFavoriteGroup, changeFavoriteGroupName, moveFavoriteGroup, editTokenFavRemark } from '~/api/fav'

const botStore = useBotStore()
const configStore = useConfigStore()
const currentAccount = localStorage.getItem('currentAccount')
const router = useRouter()
const { t } = useI18n()
const activeTab = ref(0)
const tabsGroup = ref<any[]>([])
const allTabsGroup = computed(() => {
  return [
    { label: t('defaultGroup'), value: 0 },
    ...tabsGroup.value
  ]
})
const moveList = ref<any[]>([])
const moveValue = ref('')

const addGroupPopoverRef = ref()
const editGroupPopoverRef = ref()
const moveGroupPopoverRef = ref()
const remarkGroupPopoverRef = ref()
const groupValue = ref('')
const remarkValue = ref('')
const editId = ref<number | undefined>(undefined)

const loading = ref(false)
const pageData = ref({
  total: 10,
  page: 1,
  pageSize: 10
})
const tableList = ref<any[]>([])
const { mode } = storeToRefs(useGlobalStore())

const appendix = (row: any) => {
  if (row.value?.appendix && isJSON(row.value?.appendix)) {
    return JSON.parse(row.value?.appendix)
  }
  return {}
}

// 选择分组
const setActiveTab = (val: number) => {
  activeTab.value = val
  pageData.value.page = 1
  getList()
}

// 删除分组
const handleDeleteGroup = async (groupId: number) => {
  await ElMessageBox.confirm(t('removeFavGroupTips'), t('tips'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    dangerouslyUseHTMLString: true,
    customClass: '',
  })
  await removeFavoriteGroup(groupId, botStore.evmAddress)
  ElMessage.success(t('success'))
  getGroupList()
  if (activeTab.value === groupId) {
    setActiveTab(0)
  }
}

// 添加分组
const handleAddGroup = async () => {
  if (!groupValue.value.trim()) return ElMessage.error(t('enterGroupName'))
  if (groupValue.value.length > 20) return ElMessage.error(t('maximum10characters'))
  await addFavoriteGroup(groupValue.value, botStore.evmAddress)
  ElMessage.success(t('success'))
  addGroupPopoverRef.value?.hide()
  getGroupList()
}

// 重命名分组
const handleUpdateGroup = (item: any) => {
  editId.value = item.value
  groupValue.value = item.label
}

const editHide = () => {
  editId.value = undefined
  groupValue.value = ''
}

// 确认编辑
const handleUpdateGroupConfirm = async (item: any, index: number) => {
  if (!groupValue.value.trim()) return ElMessage.error(t('enterGroupName'))
  if (groupValue.value.length > 20) return ElMessage.error(t('maximum10characters'))
  await changeFavoriteGroupName(groupValue.value, item.value, botStore.evmAddress)
  ElMessage.success(t('success'))
  editGroupPopoverRef.value[index]?.hide()
  getGroupList()
}

// 处理移动分组
const handleMoveGroup = () => {
  moveList.value = cloneDeep(tabsGroup.value)
}

// 移动分组确认
const handleMoveGroupConfirm = () => {
  console.log(moveList.value)
  moveGroupPopoverRef.value?.hide()
  tabsGroup.value = cloneDeep(moveList.value)
  ElMessage.success(t('success'))
}

// 备注
const handleRemarkGroup = async (row: any) => {
  if (!remarkValue.value.trim()) return ElMessage.error(t('enterRemark'))
  if (remarkValue.value.length > 20) return ElMessage.error(t('remarkError'))
  const tokenId = row.token + '-' + row.chain
  await editTokenFavRemark(tokenId, remarkValue.value, botStore.evmAddress)
  ElMessage.success(t('success'))
  remarkGroupPopoverRef.value?.hide()
  getList()
}

const tableRowClick = (row: any) => {
  const containsSpecialString = row?.token
    ? ['inscription', ':', '('].some(str => row.token.includes(str))
    : false

  if (
    row.chain === 'brc20' ||
    row.chain === 'runes' ||
    containsSpecialString
  ) {
    router.push(`/brc/${row.token}-${row.chain}?from=fav`)
  } else {
    router.push(`/token/${row.token}-${row.chain}?from=fav`)
  }
}

// 处理表格排序
const handleSortChange = ({ prop, order }: any) => {
  if (prop) {
    if (order === 'ascending') {
      tableList.value = tableList.value.toSorted((a, b) => a[prop] - b[prop])
    } else if (order === 'descending') {
      tableList.value = tableList.value.toSorted((a, b) => b[prop] - a[prop])
    }
  }
}

// 取消收藏
const collect = (row: any) => {
  if (!verifyLogin()) {
    return
  }
  loading.value = true
  removeFavorite(`${row.token}-${row.chain}`, botStore.evmAddress)
    .then(() => {
      getList()
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}

const getRowGroupChange = async (val: number, row: any) => {
  const tokenId = row.token + '-' + row.chain
  await moveFavoriteGroup(tokenId, val, botStore.evmAddress)
  getList()
}

// 获取列表
const getList = async () => {
  const res = await getNewFavoriteList({
    address: botStore.evmAddress,
    group: activeTab.value,
    pageNO: pageData.value.page,
    pageSize: pageData.value.pageSize
  })
  const tableData =
    (res &&
      res?.map(i => ({
        id: `${i.token}-${i.chain}`,
        ...i,
        price_change_24h:
          i?.chain == 'brc20' ? i.price_change_v2 || 0 : i.price_change || 0,
        pool_circulating_supply: (i.total - i.lock_amount - i.burn_amount - i.other_amount) * i.current_price_usd,
        group_id: activeTab.value,
      }))) ||
    []
  tableList.value = tableData
}

// 获取分组列表
const getGroupList = async () => {
  const res = await getUserFavoriteGroups(botStore.evmAddress)
  tabsGroup.value = (res || []).filter(el => !!el.name).map((item) => ({
    ...item,
    label: item.name,
    value: item.group_id
  }))
}

onMounted(() => {
  getList()
  getGroupList()
})
</script>

<template>
  <div>
    <div class="flex items-center p-12px gap-8px overflow-x-auto scrollbar-hide">
      <div v-for="(item, index) in allTabsGroup" :key="item.value"
        class="cursor-pointer text-12px color-[--d-999-l-666] bg-[--d-15171c-l-f2f2f2] px-12px py-4px rounded-4px shrink-0 flex items-center"
        :class="[activeTab === item.value && 'bg-[--d-333-l-0A0B0C] color-[#F5F5F5]']"
        @click="setActiveTab(item.value)">
        {{ item.label }}
        <el-popover trigger="click" @hide="editHide" ref="editGroupPopoverRef" :width="editId ? 250 : 100">
          <template #reference>
            <img v-if="item.value > 0" @click.stop class="w-12px h-12px ml-2px" src="@/assets/icons/set_up.svg"
              alt="" />
          </template>
          <div>
            <div v-if="!editId">
              <div class="flex items-center cursor-pointer w-100px" @click.stop="handleUpdateGroup(item)">
                <img class="w-16px h-16px mr-2px" src="@/assets/icons/fav_edit.svg" alt="" />
                <view class="ml-4px text-14px">{{ t('rename') }}</view>
              </div>
              <div class="flex items-center cursor-pointer w-100px mt-12px" @click.stop="handleDeleteGroup(item.value)">
                <img class="w-16px h-16px mr-2px" src="@/assets/icons/delete_icon.svg" alt="" />
                <view class="ml-4px text-14px">{{ t('delete') }}</view>
              </div>
            </div>
            <div v-else>
              <div>{{ t('rename') }}</div>
              <el-input v-model="groupValue" :placeholder="t('enterGroupName')" class="mt-8px w-200px" />
              <div class="flex items-center justify-between mt-12px gap-12px">
                <div @click="editGroupPopoverRef[index]?.hide()"
                  class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[--d-333-l-0A0B0C] px-12px py-8px rounded-4px">
                  {{ t('cancel') }}
                </div>
                <div @click="handleUpdateGroupConfirm(item, index)"
                  class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[#3F80F7] px-12px py-8px rounded-4px">
                  {{ t('confirm') }}
                </div>
              </div>
            </div>
          </div>
        </el-popover>
      </div>

      <el-popover trigger="click" @hide="groupValue = ''" ref="addGroupPopoverRef" :width="250">
        <template #reference>
          <!-- 新增 -->
          <div style="background: rgba(63, 128, 247, 0.10);" @click="editId = undefined"
            class="cursor-pointer text-12px color-[#3F80F7] px-12px py-4px rounded-4px shrink-0 flex items-center">
            <img class="w-12px h-12px mr-2px" src="@/assets/icons/add_icon.svg" alt="" />
            {{ t('newGroup') }}
          </div>
        </template>
        <div>
          <div>{{ t('newGroup') }}</div>
          <el-input v-model="groupValue" :placeholder="t('enterGroupName')" class="mt-8px w-200px" />
          <div class="flex items-center justify-between mt-12px gap-12px">
            <div @click="addGroupPopoverRef?.hide()"
              class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[--d-333-l-0A0B0C] px-12px py-8px rounded-4px">
              {{ t('cancel') }}
            </div>
            <div @click="handleAddGroup()"
              class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[#3F80F7] px-12px py-8px rounded-4px">
              {{ t('confirm') }}
            </div>
          </div>
        </div>
      </el-popover>
      <el-popover trigger="click" @hide="moveValue = ''" ref="moveGroupPopoverRef" :width="250">
        <template #reference>
          <div style="background: rgba(63, 128, 247, 0.10);" @click="handleMoveGroup"
            class="cursor-pointer text-12px color-[#3F80F7] px-12px py-4px rounded-4px shrink-0 flex items-center">
            <img class="w-12px h-12px mr-2px" src="@/assets/icons/list_icon.svg" alt="" />
            {{ t('groupManage') }}
          </div>
        </template>
        <div>
          <div>{{ t('groupManage') }}</div>
          <el-input v-model="moveValue" class="mt-8px" :placeholder="t('enterGroupName')" />
          <VueDraggable v-model="moveList" :sort="true" ghost-class="ghost" :animation="300">
            <div class="py-12px px-8px flex justify-between items-center"
              v-for="item in moveList.filter(item => item.label.includes(moveValue))" :key="item.value">
              {{ item.label }}
              <img class="w-16px h-16px" src="@/assets/icons/move_icon.svg" alt="" />
            </div>
          </VueDraggable>
          <div class="flex items-center justify-between mt-12px gap-12px">
            <div @click="moveGroupPopoverRef?.hide()"
              class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[--d-333-l-0A0B0C] px-12px py-8px rounded-4px">
              {{ t('cancel') }}
            </div>
            <div @click="handleMoveGroupConfirm"
              class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[#3F80F7] px-12px py-8px rounded-4px">
              {{ t('confirm') }}
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <el-table v-loading="loading" :data="tableList" stripe fit @sort-change="handleSortChange"
      @row-click="tableRowClick">
      <template #empty>
        <div v-if="!loading" class="flex flex-col items-center justify-center py-30px">
          <img v-if="mode === 'light'" src="@/assets/images/empty-white.svg">
          <img v-if="mode === 'dark'" src="@/assets/images/empty-black.svg">
          <span>{{ t('emptyNoData') }}</span>
        </div>
        <span v-else />
      </template>

      <el-table-column :label="t('poolPair')" min-width="160" show-overflow-tooltip>
        <template #default="{ row, $index }">
          <NuxtLink :to="`/token/${row.token}-${row.chain}`" @click.stop.prevent>
            <div class="flex items-center">
              <span class="text-[#848E9C] text-12px mr-5px">
                #{{ (pageData.page - 1) * pageData.pageSize + $index + 1 }}
              </span>
              <Icon v-if="botStore.evmAddress || currentAccount" name="material-symbols:kid-star"
                class="color-var(--d-999-l-666) h-16px w-16px clickable shrink-0 color-#ffbb19"
                @click.stop.prevent="collect(row)" />
              <div class="relative ml-3px">
                <el-image class="w-32px h-32px rounded-full" :src="getSymbolDefaultIcon({
                  chain: row?.chain,
                  symbol: row.symbol,
                  logo_url: row.logo_url
                })" lazy>
                  <template #error>
                    <img class="w-32px h-32px rounded-full" :src="getChainDefaultIcon(row?.chain, row.symbol)" />
                  </template>
                  <template #placeholder>
                    <img class="w-32px h-32px rounded-full" :src="getChainDefaultIcon(row?.chain, row.symbol)" />
                  </template>
                </el-image>
                <img v-if="row?.chain" class="w-12px h-12px absolute bottom-3px right-3px"
                  :src="`${configStore.token_logo_url}chain/${row?.chain}.png`" alt=""
                  onerror="this.src='/icon-default.png'" srcset="" />
              </div>
              <div class="ml-5px">
                <div class="flex items-center">
                  <span class="text-13px mr-3px">{{ row.symbol }}</span>
                  <span class="text-[--d-666-l-999]">({{ '*' + row.token?.slice(-4) }})</span>
                  <span
                    class="text-[#3f80f7] border-[0.5px] border-solid border-[#3f80f7] rounded-4px bg-transparent text-10px ml-2px px-4px max-w-[60px] truncate"
                    :title="row.remark" v-if="row.remark">{{ row.remark }}</span>

                  <el-popover trigger="click" @hide="remarkValue = ''" ref="remarkGroupPopoverRef" :width="250">
                    <template #reference>
                      <!-- 备注 -->
                      <div @click.stop.prevent='remarkValue = row.remark'>
                        <Icon class="text-[--d-666-l-999] w-12px h-12px ml-4px" name="custom:remark" />
                      </div>
                    </template>
                    <div>
                      <div>{{ t('editRemark') }}</div>
                      <el-input v-model="remarkValue" :placeholder="t('enterRemark')" class="mt-8px w-200px" />
                      <div class="flex items-center justify-between mt-12px gap-12px">
                        <div @click="remarkGroupPopoverRef?.hide()"
                          class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[--d-333-l-0A0B0C] px-12px py-8px rounded-4px">
                          {{ t('cancel') }}
                        </div>
                        <div @click="handleRemarkGroup(row)"
                          class="flex-1 text-center cursor-pointer text-14px color-[#F5F5F5] bg-[#3F80F7] px-12px py-8px rounded-4px">
                          {{ t('confirm') }}
                        </div>
                      </div>
                    </div>
                  </el-popover>
                  <a class="ml-4px"
                    :href="`https://x.com/search?q=(${row?.symbol}OR${row?.token})&src=typed_query&f=live`"
                    target="_blank" @click.stop>
                    <Icon class="text-[--d-666-l-999] h-12px w-12px" name="ep:search" />
                  </a>
                </div>
                <div class="flex items-center mt-2px">
                  <div class="text-8px text-[--d-666-l-999]">
                    {{ row?.token?.replace(new RegExp('(.{4})(.+)(.{4}$)'), '$1...$3') }}
                  </div>
                  <Icon v-copy="row?.token" name="bxs:copy" class="ml-5px clickable text-[--d-666-l-999]" />
                  <a class="flex items-center" v-tooltip="appendix(row)?.twitter" :href="appendix(row)?.twitter" target="_blank" @click.stop>
                    <Icon :name="`custom:twitter`" class="text-[--d-666-l-999] h-14px w-14px" />
                  </a>
                  <a class="flex items-center" v-tooltip="appendix(row)?.telegram" :href="appendix(row)?.telegram" target="_blank" @click.stop>
                    <Icon :name="`custom:tg`" class="text-[--d-666-l-999] h-14px w-14px" />
                  </a>
                </div>
              </div>
            </div>
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column :label="t('holders')" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="holders" align="right">
        <template #default="{ row }">
          <span>
            {{ row.holders }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="t('price')" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="current_price_usd" align="right">
        <template #default="{ row }">
          <span v-html="'$' + formatNumber2(row.current_price_usd)"></span>
        </template>
      </el-table-column>
      <el-table-column label="24h%" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="price_change_24h" align="right">
        <template #default="{ row }">
          <span v-if="Number(row.price_change_24h || 0) > 0" class="text-[#12b886]">
            +{{ formatNumber2(row.price_change_24h || 0, 2) }}%
          </span>
          <span v-else-if="Number(row.price_change_24h || 0) == 0" class="text-[#848E9C]">
            0%
          </span>
          <span v-else class="text-[#ff646d]">{{ formatNumber2(row.price_change_24h || 0, 2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('riskScore')" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="risk_score" align="right">
        <template #default="{ row }">
          <router-link :to="{ path: `/check/${row.token}-${row.chain}` }" @click.stop>
            <ArcProgress :progress="Number(row.risk_score / 100) || 0" :width="40" :thickness="2" :big="false"
              :height="20" :textHeight="15" :end="true" fontSize="12px"
              :colorList="['#eaecef', '#108D68', '#C26B03', '#BB3749']" class="arc-progress"></ArcProgress>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="t('24Volume')" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="tx_volume_u_24h" align="right">
        <template #default="{ row }">
          ${{ formatNumber2(row?.tx_volume_u_24h || 0, 2, 4, 10 ** 4) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('24TxAddress')" sortable="custom" :sort-orders="['descending', 'ascending', null]"
        prop="tx_count_24h" align="right">
        <template #default="{ row }">
          {{ formatNumber2(row?.tx_count_24h || 0, 2, 4, 10 ** 4) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('tokenGroup')" align="right">
        <template #default="{ row }">
          <el-select v-model="row.group_id" @click.stop @change="(val) => getRowGroupChange(val, row)">
            <el-option v-for="item in allTabsGroup" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="mt-20px" v-model:current-page="pageData.page" v-model:page-size="pageData.pageSize"
      layout="prev, sizes, pager, next, jumper, ->" :total="pageData.total" :page-sizes="[10, 20, 30, 40, 50, 60]" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-popover.el-popper) {
  min-width: 100px;
}

:deep(.el-pagination) {
  justify-content: center;
}
</style>
