<template>
  <div class="black-list">
    <span class="iconfont icon-laheiliebiao font-14" @click="showBlackList">
      {{ t('BlackList') }}
    </span>
    <el-dialog
      v-model="visible"
      :title="t('blackManage')"
      class="dialog"
      width="600"
      @close="closeDialog"
    >
      <div class="dialog-padding">
        <el-input
          v-model="query.q"
          class="text-[12px]"
          :placeholder="t('searchContractORName')"
          clearable
          @clear="getBlackList"
          @keyup.enter="getBlackList"
        >
          <template #prefix>
            <span class="iconfont icon-search1 pointer" @click="getBlackList"/>
          </template>
        </el-input>

        <div class="relative">
          <!-- <loading
            v-if="result.loading"
            v-model:active="result.loading"
            :backgroundColor="isLight ? '#fff' : '#131722'"
            :can-cancel="false"
            :is-full-page="false"
            :opacity="0.2"
            color="var(--custom-primary-color)"
            loader="dots"
          /> -->

          <el-table :data="result.list" class="black-list-table">
            <template #empty>
              <div v-if="!result.loading" class="font-12">
                {{ t('emptyNoData') }}
              </div>
            </template>

            <!-- <el-table-column :label="t('name')">
              <template #default="{ row }">
                <div class="align-center gap-8 font-weight-500" @click="jumpToTokenDetail(row)">
                  <TokenImg :logo_url="row.logo_url" :symbol="row.symbol" :chain="row.chain" />
                  {{ row.symbol }}
                </div>
              </template>
            </el-table-column> -->

            <el-table-column :min-width="210" :label="t('address')">
              <template #default="{ row }">
                <div v-copy="row.token" class="font-12 ellipsis-auto">
                  {{ row.token }}
                </div>
              </template>
            </el-table-column>

            <el-table-column min-width="60" header-align="right" :label="t('operation')">
              <template #default="{ row }">
                <div class="flex justify-end">
                  <el-button
                    class="recover-btn"
                    size="small"
                    :loading="row.loading"
                    @click="addWhiteList(row)"
                  >
                    {{ t('Recover') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-pagination
          v-if="result.total"
          v-model:current-page="query.pageNo"
          v-model:page-size="query.pageSize"
          class="pagination-box"
          layout="total, prev, pager, next"
          :total="result.total"
          hide-on-single-page
          background
          :page-sizes="[20, 50, 100, 200, 300, 400]"
          @size-change="getBlackList"
          @current-change="getBlackList"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// import { TokenImg } from '@/common'
import { getTokenFilterList, setUserTokenStatus,  } from '@/api/wallet'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  chain: String,
  address: String,
})

// Emits
const emit = defineEmits(['addWhite'])

// Refs
const visible = ref(false)
const query = ref({
  q: '',
  type: 'blacklist',
  pageNo: 1,
  pageSize: 5,
})

const result = ref({
  loading: false,
  list: [],
  total: 0,
})

const themeStore = useThemeStore()
// Computed
const isLight = computed(() => !themeStore.isDark)

// Methods
const showBlackList = () => {
  visible.value = true
  getBlackList()
}

const getBlackList = async () => {
  try {
    result.value.loading = true
    const res = await getTokenFilterList({
      ...query.value,
      chain: props.chain,
      address: props.address,
    })
    result.value.list = res?.data || []
    result.value.total = res?.total || 0
  } catch (error) {
    console.error('Error fetching blacklist:', error)
    result.value.list = []
  } finally {
    result.value.loading = false
  }
}

const closeDialog = () => {
  result.value.list = []
  query.value = {
    q: '',
    type: 'blacklist',
    pageNo: 1,
    pageSize: 5,
  }
}

const jumpToTokenDetail = ({ token, chain }) => {
  router.push({
    name: 'Token',
    params: { id: `${token}-${chain}` },
    query: { from: route.name },
  })
}

const addWhiteList = async ({ token, chain }) => {
  try {
    updateRowLoading(token, true)
    await setUserTokenStatus(
      {
        token,
        type: 'whitelist',
      },
      props.address,
      chain
    )
    await getBlackList()
    emit('addWhite')
    ElMessage.success(t('success'))
  } catch (error) {
    console.error('Error adding to whitelist:', error)
    ElMessage.error(t('error'))
  } finally {
    updateRowLoading(token, false)
  }
}

const updateRowLoading = (token, isLoading) => {
  const index = result.value.list.findIndex((el) => el.token === token)
  if (index > -1) {
    result.value.list[index].loading = isLoading
  }
}
</script>

<style lang="scss" scoped>
.black-list {
  .icon-laheiliebiao {
    cursor: pointer;
    color: var(--d-fff-l-333);

    &:before {
      margin-right: 4px;
    }
  }


  :deep() {
    .dialog {
      --el-dialog-padding-primary: 30px 0;
      --el-dialog-bg-color: var(--d-222-l-fff);

      .black-list-table {
        --el-table-header-bg-color: var(--a-bg-7-color);
        background-color: var(--d-222-l-fff);
      }
    }

    .el-dialog__header {
      display: flex;
      align-items: center;
      padding: 0 20px 20px;
      font-weight: 500;
      font-size: 24px;
      line-height: 30px;
      border-bottom: 1px solid var(--d-333333-l-F2F2F2);
    }

    .el-dialog__headerbtn {
      top: 22px;
    }

    .el-input__wrapper {
      background: var(--a-bg-7-color);
      box-shadow: none;

      .el-input__inner {
        color: var(--a-text-1-color);
      }
    }

    .el-table {
      tr {
        background-color: var(--d-222-l-fff);
      }
    }
  }

  .dialog-padding {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 20px 0;
  }

  .recover-btn {
    padding-left: 8px;
    padding-right: 8px;
    height: 20px;
    font-size: 12px;
    border-radius: 2px;
    background-color: var(--d-333333-l-F2F2F2);
    border-color: var(--d-333333-l-F2F2F2);

    &:hover {
      color: var(--d-333333-l-F2F2F2);
      background-color: var(--d-fff-l-333);
    }
  }

  .pagination-box {
    margin: 0 auto;
  }
}
</style>
