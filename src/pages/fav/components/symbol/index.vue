<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatNumber2 } from '~/utils/formatNumber'
import { getChainDefaultIcon } from '~/utils'
import ArcProgress from '~/components/arcProgress.vue'
import { getNewFavoriteList, getUserFavoriteGroups, removeFavorite } from '~/api/fav'

const botStore = useBotStore()
const configStore = useConfigStore()
const currentAccount = localStorage.getItem('currentAccount')
const router = useRouter()
const { t } = useI18n()
const activeTab = ref(0)

const tabsGroup = ref<any[]>([])

const loading = ref(false)
const pageData = ref({
  total: 10,
  page: 1,
  pageSize: 10
})
const tableList = ref<any[]>([])
const { mode } = storeToRefs(useGlobalStore())

const setActiveTab = (val: number) => {
  activeTab.value = val
  pageData.value.page = 1
  getList()
}

const tableRowClick = (row: any) => {
  // 检查 row.token 是否包含指定字符串
  const containsSpecialString = row?.token
    ? ['inscription', ':', '('].some(str => row.token.includes(str))
    : false

  if (
    row.chain === 'brc20' ||
    row.chain === 'runes' ||
    containsSpecialString
  ) {
    router.push({
      name: 'Brc',
      params: { id: row.token + '-' + row.chain },
      query: { from: 'Fav' }
    })
  } else {
    router.push({
      name: 'Token',
      params: { id: row.token + '-' + row.chain },
      query: { from: 'Fav' }
    })
  }
}

const handleSortChange = ({ prop, order }: any) => {
  if (prop) {
    if (order === 'ascending') {
      tableList.value = tableList.value.toSorted((a, b) => a[prop] - b[prop])
    } else if (order === 'descending') {
      tableList.value = tableList.value.toSorted((a, b) => b[prop] - a[prop])
    }
  }
}

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
      }))) ||
    []
  tableList.value = tableData
}

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
      <div
        class="cursor-pointer text-12px color-[--d-999-l-666] bg-[--d-15171c-l-f2f2f2] px-8px py-4px rounded-4px shrink-0"
        :class="[activeTab === 0 && 'bg-[--d-333-l-0A0B0C] color-[#F5F5F5]']" @click="setActiveTab(0)">
        {{ t('defaultGroup') }}
      </div>
      <div v-for="(item) in tabsGroup" :key="item.value"
        class="cursor-pointer text-12px color-[--d-999-l-666] bg-[--d-15171c-l-f2f2f2] px-8px py-4px rounded-4px shrink-0 flex items-center"
        :class="[activeTab === item.value && 'bg-[--d-333-l-0A0B0C] color-[#F5F5F5]']"
        @click="setActiveTab(item.value)">
        {{ item.label }}
        <!-- <Icon name="custom:add_icon" class="text-12px text-[#F6465D] clickable" /> -->
      </div>
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
                class="color-var(--d-999-l-666) h-16px w-16px clickable color-#ffbb19"
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
                <span class="text-13px mr-3px">{{ row.symbol }}</span>
                <span class="text-[#666]">({{ '*' + row.token?.slice(-4) }})</span>
                <button class="btn-remark" :title="row.remark" v-if="row.remark">{{ row.remark }}</button>
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
    </el-table>

    <el-pagination class="mt-20px" v-model:current-page="pageData.page" v-model:page-size="pageData.pageSize"
      layout="prev, sizes, pager, next, jumper, ->" :total="pageData.total" :page-sizes="[10, 20, 30, 40, 50, 60]" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-pagination) {
  justify-content: center;
}

.btn-remark {
  color: #3f80f7;
  border: 0.5px solid #3f80f7;
  border-radius: 4px;
  background-color: transparent;
  font-size: 10px;
  font-weight: 400;
  margin: 0 0 0 2px;
  padding: 2px 4px;
  max-width: 60px;
}
</style>
