<script setup lang="ts">
import FavDialog from '~/pages/token/components/left/favDialog.vue'
import {
  type GetUserFavoriteGroupsResponse,
  type GetFavListResponse,
  getFavoriteList,
  getUserFavoriteGroups
} from '~/api/fav'
import TokenImg from '~/components/tokenImg.vue'
import {formatNumber} from '~/utils/formatNumber'
import THead from '~/pages/token/components/left/tHead.vue'

const {t} = useI18n()
const props = defineProps({
  height: {
    type: [Number, String],
    default: 0
  }
})
const scrollbarHeight = computed(() => {
  return Number(props.height) - 110
})
const botStore = useBotStore()
const editVisible = shallowRef(false)
const loading = shallowRef(false)
const userFavoriteGroups = shallowRef<GetUserFavoriteGroupsResponse[]>([])
const activeTab = shallowRef(0)
const sort = shallowRef<{
  activeSort: number,
  sortBy: 'symbol' | 'current_price_usd' | 'price_change' | null
}>({
  activeSort: 0,
  sortBy: null
})
const listStatus = ref({
  finished: false,
  loading: false,
  pageNo: 1
})
const favoritesList = shallowRef<GetFavListResponse[]>([])
const columns = computed(() => {
  return [{
    label: t('token'),
    value: 'symbol',
    flex: 'flex-1',
    sort: true
  }, {
    label: t('price') + '/Chg%',
    value: 'current_price_usd',
    flex: 'flex-1 justify-end',
    sort: true
  },
    //   {
    //   label: '24H%',
    //   value: 'price_change',
    //   flex: 'flex-1 justify-end',
    //   sort: true
    // }
  ]
})
const sortedFavList = computed(() => {
  if (sort.value.activeSort === 0 || !sort.value.sortBy) {
    return favoritesList.value
  }
  return favoritesList.value.toSorted((a: any, b: any) => {
    if (sort.value.sortBy === 'symbol') {
      const codeB = b[sort.value.sortBy][0].toLowerCase().charCodeAt(0) || 0
      const codeA = a[sort.value.sortBy][0].toLowerCase().charCodeAt(0) || 0
      return codeB - codeA
    } else {
      return ((b[sort.value.sortBy!] || 0) - (a[sort.value.sortBy!] || 0)) * sort.value.activeSort
    }
  })
})

onMounted(() => {
  if (botStore.evmAddress) {
    _getUserFavoriteGroups()
  }
})
watch(() => botStore.evmAddress, () => {
  _getUserFavoriteGroups()
})

async function _getUserFavoriteGroups() {
  try {
    loading.value = true
    const res = await getUserFavoriteGroups(botStore.evmAddress)
    userFavoriteGroups.value = [{
      group_id: 0,
      name: t('defaultGroup')
    }].concat((res || []).filter(el => !!el.name))
  } catch (e) {
    console.log('=>(favoriteTable.vue:19) e', e)
  } finally {
    loading.value = false
  }
}

function onEdit() {
  editVisible.value = true
}

onMounted(() => {
  loadMoreFavorites()
})

function setActiveTab(groupId: number) {
  activeTab.value = groupId
  resetListStatus()
  loadMoreFavorites()
}

async function loadMoreFavorites() {
  try {
    listStatus.value.loading = true
    const pageNo = listStatus.value.pageNo
    const res = await getFavoriteList(activeTab.value, pageNo, botStore.evmAddress)
    if (Array.isArray(res) && res?.length > 0) {
      const list = res.map(i => ({
        ...i,
        id: i.token + '-' + i.chain,
        address: i.token,
        network: i.chain,
        price_change: i?.price_change ? i?.price_change : 0,
        current_price_usd: i?.current_price_usd || 0,
        collected: true
      }))
        .filter(i => (i?.chain !== 'brc20'
          && i?.chain !== 'runes'
          && !i?.token?.includes('inscription:')
          && !i?.token?.includes('(')))

      if (pageNo === 1) {
        favoritesList.value = list
      } else {
        favoritesList.value = favoritesList.value.concat(list)
      }
      listStatus.value.finished = res?.length === 0
      if (!listStatus.value.finished) {
        listStatus.value.pageNo++
      }
    } else {
      if (listStatus.value.pageNo === 1) {
        favoritesList.value = []
      }
    }
  } catch (e) {
    console.log('=>(favoriteTable.vue:106) (e)', (e))
  } finally {
    listStatus.value.loading = false
  }
}

function resetListStatus() {
  listStatus.value.finished = false
  listStatus.value.pageNo = 1
}

function getColorClass(val: number) {
  if (val === 0) {
    return 'color-#848E9C'
  } else if (val > 0) {
    return 'color-#12b886'
  } else {
    return 'color-#ff646d'
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between pr-15px pl-12px mt-10px">
      <div
        class="flex items-center gap-10px whitespace-nowrap overflow-x-auto overflow-y-hidden max-w-80% scrollbar-hide">
        <span
          v-for="(item,index) in userFavoriteGroups"
          :key="index"
          :class="`text-12px cursor-pointer ${activeTab===item.group_id?'color-[var(--d-F5F5F5-l-333)]':'color-#80838b'}`"
          @click="setActiveTab(item.group_id)"
        >
        {{ item.name }}
        </span>
      </div>
      <Icon
        name="custom:edit"
        class="text-14px mr-0 cursor-pointer color-#80838b hover:color-#286DFF"
        @click.self="onEdit"
      />
    </div>
    <THead
      v-model:sort="sort"
      :columns="columns"
    />
    <el-scrollbar
      ref="otherListArea"
      :height="scrollbarHeight"
    >
      <div
        v-infinite-scroll="loadMoreFavorites"
        :infinite-scroll-disabled="listStatus.loading || listStatus.finished"
        infinite-scroll-distance="200"
        :infinite-scroll-delay="10"
        :infinite-scroll-immediate="false"
      >
        <div class="pb-20px">
          <NuxtLink
            v-for="(row, $index) in sortedFavList"
            :key="$index"
            class="px-10px flex items-center min-h-35px cursor-pointer hover:bg-[var(--d-1D2232-l-F5F5F5)]"
            :to="`/token/${row.token}-${row.chain}`"
          >
            <div class="flex items-center flex-1">
              <TokenImg
                class="mr-8px"
                :row="row"
                token-class="w-20px h-20px"
              />
              <span class="text-12px">{{ row.symbol }}</span>
            </div>
            <div class="flex-1 text-12px text-right">
              <div>
                ${{
                  formatNumber(row.current_price_usd || 0, 4)
                }}
              </div>
              <div
                :class="`flex-1 text-right text-12px
                ${getColorClass(Number(row.price_change))}
            `">
                <template v-if="Number(row.price_change) === 0">0</template>
                <template v-else-if="row.price_change === '--'">--</template>
                <template v-else>
                  {{
                    Number(row.price_change) > 0 ? '+' : '-'
                  }}{{ formatNumber(Math.abs(Number(row.price_change)) || 0, 2) }}%
                </template>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div
          v-if="listStatus.loading"
          class="color-#959a9f text-12px text-center"
        >
          {{ $t('loading') }}
        </div>
      </div>
    </el-scrollbar>

    <FavDialog
      v-model:visible="editVisible"
      :loading="loading"
      :get-data="_getUserFavoriteGroups"
      :list="userFavoriteGroups"
    />
  </div>
</template>

<style scoped>

</style>
