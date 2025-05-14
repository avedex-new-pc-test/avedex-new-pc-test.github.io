<script setup lang="ts">
import {
  changeFavoritesTop,
  type GetFavListResponse,
  getFavoriteList,
  type GetUserFavoriteGroupsResponse,
  moveFavoriteGroup,
  changeFavoritesIndex, editTokenFavRemark
} from '~/api/fav'
import TokenImg from '~/components/tokenImg.vue'

defineProps({
  list: {
    type: Array<GetUserFavoriteGroupsResponse>,
    default: () => []
  },
})
const {t} = useI18n()
const {token_logo_url} = useConfigStore()
const {evmAddress} = useBotStore()
const activeTab = shallowRef(0)
const favoritesList = shallowRef<GetFavListResponse[]>([])
const listStatus = shallowRef({
  loading: false,
  finished: false,
  pageNo: 1,
})

onMounted(() => {
  _getFavoriteList()
})

function setActiveTab(val: number) {
  activeTab.value = val
  resetAndGet()
}

watch(() => evmAddress, () => {
  _getFavoriteList()
})

async function _getFavoriteList() {
  if (listStatus.value.loading) {
    return
  }
  try {
    listStatus.value.loading = true
    const res = await getFavoriteList(activeTab.value, listStatus.value.pageNo, evmAddress)
    const newItems = (res || []).map(i => ({
      ...i,
      id: i.token + '-' + i.chain,
      address: i.token,
      network: i.chain,
      priceChange24h: i?.price_change ? i?.price_change / 100 : 0,
      priceUSD: i?.current_price_usd || 0,
      activeGroup: activeTab.value
    }))
    if (listStatus.value.pageNo === 1) {
      favoritesList.value = newItems
    } else {
      favoritesList.value = [...favoritesList.value, ...newItems]
    }
    if (res?.length === 0) {
      listStatus.value.finished = true
    }
  } catch (e) {
    console.log('=>(dialogFavoriteManage.vue:52) (e)', (e))
  } finally {
    listStatus.value.loading = false
  }
}

async function confirmSwitchGroup(row: GetFavListResponse, id: number) {
  try {
    await moveFavoriteGroup(
      row.token + '-' + row.chain, id, evmAddress
    )
    ElMessage.success(t('success'))
    _getFavoriteList()
  } catch (e) {
    console.log('=>(dialogFavoriteManage.vue:76) e', e)
    ElMessage.error(t('fail'))
  }
}

async function tokenSetTop(item: GetFavListResponse, index: number) {
  if (index === 0) {
    return
  }
  try {
    await changeFavoritesTop(
      item.token + '-' + item.chain,
      activeTab.value,
      evmAddress
    )
    ElMessage.success(t('success'))
    resetAndGet()
  } catch (e) {
    console.log('=>(dialogFavoriteManage.vue:94) e', e)
    ElMessage.error(t('fail'))
  }
}

async function _changeFavoritesIndex(item: GetFavListResponse, index: number, direction: number) {
  const id = item.token + '-' + item.chain
  const j = index + direction
  if (j < 0 || j + 1 > favoritesList.value.length) {
    return
  }
  const item1 = favoritesList.value[j]
  const id1 = item1.token + '-' + item1.chain
  try {
    await changeFavoritesIndex(id, id1, activeTab.value, evmAddress)
    ElMessage.success(t('success'))
    resetAndGet()
  } catch (e) {
    console.log('=>(dialogFavoriteManage.vue:114) e', e)
    ElMessage.error(t('fail'))
  }
}

function resetAndGet() {
  listStatus.value.pageNo = 1
  listStatus.value.finished = false
  _getFavoriteList()
}

async function handleEditRemark(item: GetFavListResponse) {
  const tokenId = item.token + '-' + item.chain
  const {value} = await ElMessageBox.prompt('', t('enterRemark'), {
    confirmButtonText: t('confirm1'),
    cancelButtonText: t('cancel'),
    inputValidator: val => {
      if (val?.length > 50) {
        return t('maximum10characters')
      }
      return true
    }
  })
  confirmEditRemark(value, tokenId)
}

async function confirmEditRemark(remark: string, tokenId: string) {
  try {
    await editTokenFavRemark(tokenId, remark, evmAddress)
    _getFavoriteList()
    ElMessage.success(t('success'))
  } catch (e) {
    console.log('=>(dialogFavoriteManage.vue:149) e', e)
  }
}
</script>

<template>
  <div>
    <a
      v-for="(item, $index) in list"
      :key="$index" href="javascript:;"
      :class="`decoration-none inline-block text-14px  px-4px h-44px lh-44px
              ${item.group_id === activeTab?'color-[var(--d-F5F5F5-l-333)]':'color-#80838b'}`"
      @click.stop.prevent="setActiveTab(item.group_id)"
    >
      {{ item.name }}
    </a>
    <el-table
      id="table_fav"
      ref="table_ref"
      v-loading="listStatus.loading"
      v-infinite-scroll="_getFavoriteList"
      :data="favoritesList"
      height="350px"
      class="w-full table-container"
      highlight-current-row
    >
      <el-table-column
        :label="$t('token')"
      >
        <template #default="{ row }">
          <div class="flex items-center">
            <TokenImg
              class="mr-8px"
              :row="row"
            />
            <span class="token-symbol">{{ row.symbol }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('changeGroup')" align="center">
        <template #default="{ row }">
          <el-select
            v-model="row.activeGroup"
            :placeholder="$t('pleaseSelectGroup')"
            @change="confirmSwitchGroup(row, $event)"
          >
            <el-option
              v-for="item in list"
              :key="item.group_id"
              :label="item.name"
              :value="item.group_id"
              :disabled="activeTab === item.group_id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="$t('sort')" align="center">
        <template #default="{ row, $index }">
          <el-button
            link
            size="small"
            :disabled="$index === 0"
            @click.stop="tokenSetTop(row, $index)"
          >
            {{ $t('top') }}
          </el-button>
          <el-button
            link
            size="large"
            :disabled="$index === 0"
            @click.stop="_changeFavoritesIndex(row, $index, -1)"
          >
            {{ $t('up') }}
          </el-button>
          <el-button
            link
            size="large"
            :disabled="$index + 1 === favoritesList.length"
            @click.stop="_changeFavoritesIndex(row, $index, 1)"
          >
            {{ $t('down') }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('remark')" show-overflow-tooltip align="center">
        <template #default="{ row }">
          <span>{{ row.remark || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operate')" align="left">
        <template #default="{ row }">
          <span
            class="cursor-pointer color-[var(--d-F5F5F5-l-333)]"
            @click.stop.prevent="handleEditRemark(row)">
            {{ $t('edit') }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-if="listStatus.pageNo!==1 && listStatus.loading"
      class="flex justify-center items-center py-15px text-14px">
      <span>{{ $t('loading') }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
