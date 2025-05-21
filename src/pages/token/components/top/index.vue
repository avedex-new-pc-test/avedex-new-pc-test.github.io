<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    class="info flex items-center bg-[--d-111-l-FFF] mb-4px h-64px p-x-16px text-12px font-500 color-[--d-666-l-999]"
  >
    <Icon
      name="material-symbols:kid-star"
      class="color-#696E7C h-16px w-16px clickable"
      :class="collected ? 'color-#ffbb19' : ''"
      @click="collect"
    />
    <div class="token-info ml-16px flex items-center color-[--d-666-l-999]">
      <div
        v-if="getSymbolDefaultIcon(token)"
        class="icon-token-container relative"
      >
        <el-image
          class="token-icon rounded-100%"
          :src="getSymbolDefaultIcon(token)"
          lazy
        >
          <template #error>
            <img
              class="token-icon"
              :src="getChainDefaultIcon(token?.chain, token?.symbol)"
            />
          </template>
          <template #placeholder>
            <img
              class="token-icon"
              :src="getChainDefaultIcon(token?.chain, token?.symbol)"
            />
          </template>
        </el-image>
        <img
          v-if="token?.chain"
          class="icon-symbol rounded-100%"
          :src="`${token_logo_url}chain/${token?.chain}.png`"
        />
      </div>
      <div class="ml-8px">
        <div class="flex items-center">
          <span
            class="text-16px leading-[1.25] color-[--d-F5F5F5-l-333] font-500"
            >{{ token?.symbol }}</span
          >
          <span class="ml-8px text-12px font-500">{{ token?.name }}</span>
          <div v-if="medias?.length > 0" class="ml-46px flex">
            <div v-for="(item, index) in medias" :key="index" class="tag-btn">
              <template v-if="item.url">
                <span
                  v-if="item.name === 'QQ'"
                  v-tooltip="item.url"
                  class="bg-btn"
                >
                  <Icon :name="`custom:${item.icon}`" class="text-[--d-666-l-999] h-16px w-16px"/>
                </span>
                <a
                  v-else
                  v-tooltip="item.url"
                  :href="item.url"
                  target="_blank"
                  class="bg-btn"
                  @click.stop
                >
                  <Icon
                    :name="`custom:${item.icon}`"
                    class="text-[--d-666-l-999] h-16px w-16px"
                  />
                </a>
              </template>
            </div>
          </div>
          <a
            class="media-item bg-btn"
            :href="`https://x.com/search?q=($${token?.symbol} OR ${token?.token})&src=typed_query&f=live`"
            target="_blank"
          >
            <Icon
              class="text-[--d-666-l-999] h-16px w-16px"
              name="material-symbols:search-rounded"
            />
          </a>
          <template v-if="getTags(pair)?.normal_tag?.length > 0">
            <div
              v-for="(i, index) in getTags(pair)?.normal_tag"
              :key="index"
              class="bg-btn flex h-16px"
            >
              <el-image
                v-tooltip="$t(`${i.tag}`)"
                class="token-icon-tag cursor-pointer h-100%"
                :src="formatIconTag(i.tag)"
                lazy
              >
                <template #error>
                  <img class="token-icon-tag h-16px" src="/icon-default.png" />
                </template>
                <template #placeholder>
                  <img class="token-icon-tag h-16px" src="/icon-default.png" />
                </template>
              </el-image>
              <span
                v-if="i?.showText"
                :style="{
                  color: i?.color == 'green' ? upColor : downColor,
                }"
                class="text-10px ml-4px"
              >
                {{ $t(i?.tag) }}
              </span>
            </div>
          </template>

          <el-popover
            v-if="collected"
            v-model:visible="editableGroup"
            placement="bottom"
            popper-class="chains-table-filter"
            title=""
            :width="200"
            trigger="click"
          >
            <template #reference>
              <a class="w-zu flex-start bg-btn" href="" @click.stop.prevent>
                <Icon
                  class="text-[--d-666-l-999] h-12px"
                  name="custom:groups"
                />
                <span class="ml-2px ellipsis block" style="max-width: 140px">
                  {{ currentGroup }}
                </span>
              </a>
            </template>
            <template #default>
              <div class="filter-box">
                <span>{{ $t('editGroup') }}</span>
                <div class="flex mt-10px">
                  <el-select
                    v-model="selectedGroup"
                    class="select3"
                    :placeholder="$t('pleaseSelectGroup')"
                    :teleported="false"
                  >
                    <el-option :label="$t('defaultGroup')" :value="0" />
                    <el-option
                      v-for="item in userFavoriteGroups"
                      :key="item.group_id"
                      :label="item.name"
                      :value="item.group_id"
                    />
                  </el-select>
                </div>
                <div class="mt-20px flex-center">
                  <el-button
                    class="flex-1"
                    size="default"
                    style="
                      height: 30px;
                      min-width: 70px;
                      --el-button-font-weight: 400;
                    "
                    :color="theme !== 'dark' ? '#f2f2f2' : '#333333'"
                    @click.stop="handleReset()"
                  >
                    {{ $t('cancel') }}
                  </el-button>
                  <el-button
                    v-loading="loadingGroupEdit"
                    class="flex-1"
                    size="default"
                    style="
                      height: 30px;
                      min-width: 70px;
                      --el-button-font-weight: 400;
                    "
                    :color="theme !== 'dark' ? '#222222' : '#f5f5f5'"
                    @click.stop="
                      confirmSwitchGroup(id, selectedGroup, evmAddress)
                    "
                  >
                    {{ $t('confirm') }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-popover>
          <el-popover
            v-if="collected"
            v-model:visible="editableRemark"
            placement="bottom"
            popper-class="chains-table-filter"
            title=""
            :width="200"
            trigger="click"
          >
            <template #reference>
              <a class="w-zu flex-start bg-btn" href="" @click.stop.prevent>
                <Icon
                  class="text-[--d-666-l-999] h-12px"
                  name="custom:remark"
                />
                <span class="ml-2px ellipsis block" style="max-width: 140px">{{
                  remark
                }}</span>
              </a>
            </template>
            <template #default>
              <div class="filter-box">
                <span>{{ $t('editRemark') }}</span>
                <div class="flex mt-10px">
                  <el-input
                    v-model.trim="remark2"
                    :placeholder="remark"
                    clearable
                  />
                </div>
                <div class="mt-20px flex-center">
                  <el-button
                    class="flex-1"
                    size="default"
                    style="
                      height: 30px;
                      min-width: 70px;
                      margin-left: auto;
                      --el-button-font-weight: 400;
                    "
                    :color="theme !== 'dark' ? '#f2f2f2' : '#333333'"
                    @click.stop="handleReset()"
                  >
                    {{ $t('cancel') }}
                  </el-button>
                  <el-button
                    class="flex-1"
                    size="default"
                    :color="theme !== 'dark' ? '#222222' : '#f5f5f5'"
                    style="
                      height: 30px;
                      min-width: 70px;
                      --el-button-font-weight: 400;
                    "
                    @click.stop="confirmEditRemark(remark2, id)"
                  >
                    {{ $t('confirm') }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-popover>
        </div>
        <div class="clickable text-12px font-500 flex items-center">
          <a
            v-if="token?.token !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'"
            class="hover:color-[--d-F5F5F5-l-333]"
            :href="formatExplorerUrl(token?.chain as string, token?.token as string)"
            target="_blank"
          >
            {{
              token?.token?.replace(new RegExp('(.{4})(.+)(.{4}$)'), '$1...$3')
            }}
          </a>
          <Icon v-copy="token?.token" name="bxs:copy" class="ml-5px" />
          <span
            v-if="pair"
            v-tooltip="formatDate(pair?.created_at)"
            class="ml-5px hover:color-[--d-F5F5F5-l-333]"
            >{{ dayjs(pair?.created_at * 1000).fromNow() }}</span
          >
          <template v-if="getTags(pair)?.signal_arr?.length > 0">
            <div
              v-for="(i, index) in getTags(pair)?.signal_arr?.slice(0, 3)"
              :key="index"
              v-tooltip="
                getTagTooltip(i) +
                (i.tag == 'smarter_buy' || i.tag == 'smarter_sell'
                  ? `（${$t('amountU')}>$10)`
                  : '')
              "
              class="flex bg-btn signal pointer ml-4px"
            >
              <el-image
                class="token-icon-signal-tag h-16px"
                :src="formatIconTag(i.tag)"
                lazy
              >
                <template #error>
                  <img
                    class="token-icon-signal-tag h-16px"
                    src="/icon-default.png"
                  />
                </template>
                <template #placeholder>
                  <img
                    class="token-icon-signal-tag h-16px"
                    src="/icon-default.png"
                  />
                </template>
              </el-image>
              <div
                v-if="
                  (i?.tag == 'smarter_buy' || i?.tag == 'smarter_sell') &&
                  (pair?.smart_money_buy_count_24h > 0 ||
                    pair?.smart_money_sell_count_24h > 0)
                "
                class="ml-2"
                style="color: #959a9f"
              >
                <span
                  :style="{
                    color: pair?.smart_money_buy_count_24h > 0 ? upColor : '',
                  }"
                >
                  {{ formatNumber(pair?.smart_money_buy_count_24h || 0, 0) }}
                </span>
                /
                <span
                  :style="{
                    color:
                      pair?.smart_money_sell_count_24h > 0 ? downColor : '',
                  }"
                >
                  {{ formatNumber(pair?.smart_money_sell_count_24h || 0, 0) }}
                </span>
              </div>

              <span
                class="ml-2"
                :style="{
                  color: i.color == 'green' ? upColor : downColor,
                }"
              >
                <template v-if="i.tag">
                  <template v-if="new RegExp('_buy.*$', 'gi').test(i.tag)">
                    {{ $t('buy') }}
                  </template>
                  <template
                    v-else-if="new RegExp('_sell.*$', 'gi').test(i.tag)"
                  >
                    {{ $t('sell') }}
                  </template>
                  <template v-else>
                    {{ $t(i.tag) }}
                  </template>
                </template>
              </span>
            </div>
          </template>
          <div
            v-if="
              getTags(pair)?.signal_arr?.findIndex(
                (i) => i.tag == 'smarter_buy'
              ) == -1 &&
              getTags(pair)?.signal_arr?.findIndex(
                (i) => i.tag == 'smarter_sell'
              ) == -1 &&
              (pair?.smart_money_buy_count_24h > 0 ||
                pair?.smart_money_sell_count_24h)
            "
            v-tooltip="
              getTagTooltip({
                smart_money_buy_count_24h: pair?.smart_money_buy_count_24h,
                smart_money_sell_count_24h: pair?.smart_money_sell_count_24h,
              })
            "
            class="minor flex-end color-text-2 tag-btn signal cursor-pointer ml-4px"
          >
            <Icon
              class="text-[--d-666-l-999] h-12px w-12px mr-2px"
              name="custom:smart"
            />
            <span class="mr-2px">{{ $t('smarter') }}</span>
            <span
              :style="{
                color:
                  pair?.smart_money_buy_count_24h > 0
                    ? upColor
                    : 'var(--custom-text-3-color)',
              }"
            >
              {{ formatNumber(pair?.smart_money_buy_count_24h || 0, 0) }}
            </span>
            /
            <span
              :style="{
                color:
                  pair?.smart_money_sell_count_24h > 0
                    ? downColor
                    : 'var(--custom-text-3-color)',
              }"
            >
              {{ formatNumber(pair?.smart_money_sell_count_24h || 0, 0) }}
            </span>
          </div>
          <top50 />
        </div>
      </div>
    </div>

    <div class="flex-1" />
    <div
      v-if="pair?.progress || (0 > 0 && pair?.progress) || 0 < 100"
      class="item"
    >
      <div class="flex items-center">
        <span>{{ $t('progress') }}</span
        ><span class="ml-5px">{{ formatNumber(pair?.progress || 0, 2) }}%</span>
        <Icon
          v-if="pair?.amm === 'unknown'"
          v-tooltip="pair?.amm"
          name="tdesign:help-circle-filled"
          class="ml-5px"
        />
        <a
          v-else
          v-tooltip="pair?.amm"
          :href="pair?.swap_url || '' + pair?.target_token || ''"
          target="_blank"
          class="ml-5px"
        >
          <img
            class="rounded-50% h-16px w-16px"
            :src="formatIconSwap(pair?.amm)"
            onerror="this.src='/icon-default.png'"
            height="16"
          />
        </a>
      </div>
      <el-progress
        class="mt-10px"
        :percentage="pair?.progress"
        :stroke-width="4"
        color="#1CC982"
        :show-text="false"
        style="width: 70px"
      />
    </div>
    <div class="item ml-24px">
      <span class="text-20px color-[--d-F5F5F5-l-333]">
        ${{ formatNumber(price || 0) }}</span
      >
      <span
        class="block mt-4px color-[--d-F5F5F5-l-333]"
        :class="priceChange > 0 ? `color-${upColor}` : `color-${downColor}`"
        >{{ priceChange > 0 ? '+' : '' }}{{ formatNumber(priceChange) }}%</span
      >
    </div>

    <div class="item ml-24px">
      <span>{{ $t('mcap') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(marketCap, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>{{ $t('24Volume') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(volume24, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>{{ $t('holders') }}</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">{{
        formatNumber(token?.holders || 0, 2)
      }}</span>
    </div>
    <div class="item ml-24px">
      <span>DEV</span>
      <span class="block mt-4px color-[--d-F5F5F5-l-333]">--</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import Top50 from './top50'
import {
  getSymbolDefaultIcon,
  getChainDefaultIcon,
  formatExplorerUrl,
  formatDate,
  formatIconSwap,
  isJSON,
  formatIconTag,
} from '@/utils/index'
import {
  type GetUserFavoriteGroupsResponse,
  getFavoriteCheck,
  addFavorite,
  removeFavorite,
  getUserFavoriteGroups,
  getCheckFavoriteGroup,
  moveFavoriteGroup,
  editTokenFavRemark,
} from '@/api/fav'
import { upColor, downColor } from '@/utils/constants'
import { formatNumber } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
const { token_logo_url } = useConfigStore()
const tokenStore = useTokenStore()
const { evmAddress } = useBotStore()
const { theme } = useThemeStore()
const { t } = useI18n()
const route = useRoute()
const id = route.params?.id as string
const editableGroup = shallowRef(false)
const groupId = shallowRef(0)
const selectedGroup = shallowRef(0)
const loadingGroup = shallowRef(false)
const loadingGroupEdit = shallowRef(false)
const userFavoriteGroups = shallowRef<GetUserFavoriteGroupsResponse[]>([])

const editableRemark = shallowRef(false)
const remark = shallowRef('')
const remark2 = shallowRef('')

const token = computed(() => {
  return tokenStore.token
})
const pair = computed(() => {
  return tokenStore.pair
})
const price = computed(() => {
  return tokenStore.price
})
const priceChange = computed(() => {
  return tokenStore.priceChange || 0
})
const marketCap = computed(() => {
  return tokenStore.marketCap || 0
})

const volume24 = computed(() => {
  // console.log('-------tokenInfoExtra---------', tokenStore.tokenInfoExtra)
  return tokenStore.tokenInfoExtra?.volume_24 || 0
})
const appendix = computed(() => {
  if (token.value?.appendix && isJSON(token.value?.appendix)) {
    return JSON.parse(token.value?.appendix)
  }
  return {}
})
const medias = computed(() => {
  console.log('--------appendix----', appendix.value)
  return [
    { name: t('website'), icon: 'web', url: appendix.value?.website },
    { name: 'Btok', icon: 'btok', url: appendix.value?.btok },
    { name: 'QQ', icon: 'qq', url: appendix.value?.qq },
    { name: 'Telegram', icon: 'tg', url: appendix.value?.telegram },
    { name: 'Twitter', icon: 'twitter', url: appendix.value?.twitter },
  ]
})
const currentGroup = computed(() => {
  return groupId.value == 0
    ? t('defaultGroup')
    : userFavoriteGroups.value?.find((i) => i.group_id == groupId.value)?.name
})
// const tokenInfo = computed(() => {
//   return tokenStore.tokenInfo || 0
// })
// console.log('-------tokenInfo---------', tokenInfo)
// console.log('-------token---------', token)
onMounted(() => {
  if (evmAddress) {
    getTokenFavoriteCheck()
    getTokenCheckFavoriteGroup() //获取当前分组
    getTokenUserFavoriteGroups() //获取分组数组
  }
})
watch(
  () => evmAddress,
  () => {
    getTokenUserFavoriteGroups()
  }
)
const collected = shallowRef(false)
const loading = shallowRef(false)

function getTokenFavoriteCheck() {
  getFavoriteCheck(id, evmAddress)
    .then((res) => {
      console.log('------getFavoriteCheck---------', res, typeof res)
      collected.value = res == true ? true : false
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {})
}

function addTokenFavorite() {
  loading.value = true
  addFavorite(id, evmAddress)
    .then(() => {
      ElMessage.success('收藏成功！')
      collected.value = true
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}
function removeTokenFavorite() {
  loading.value = true
  removeFavorite(id, evmAddress)
    .then(() => {
      ElMessage.success('已取消收藏！')
      collected.value = false
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}
function collect() {
  if (evmAddress) {
    if (collected.value) {
      removeTokenFavorite()
    } else {
      addTokenFavorite()
    }
  } else {
    ElMessage.error('请链接钱包')
  }
}
async function getTokenUserFavoriteGroups() {
  try {
    loadingGroup.value = true
    const res = await getUserFavoriteGroups(evmAddress)
    userFavoriteGroups.value = (res || []).filter(
      (el) => !!el.name && el.type === 'token'
    )
  } catch (e) {
    console.log('=>(favoriteTable.vue:19) e', e)
  } finally {
    loadingGroup.value = false
  }
}
//获取用户当前分组
function getTokenCheckFavoriteGroup() {
  getCheckFavoriteGroup(id, evmAddress)
    .then((res) => {
      groupId.value = typeof res == 'number' ? res : 0
      selectedGroup.value = typeof res == 'number' ? res : 0
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {})
}

function confirmSwitchGroup(tokenId, id, evmAddress) {
  if (!evmAddress) {
    return
  }
  if (groupId.value !== id) {
    loadingGroupEdit.value = true
    moveFavoriteGroup(tokenId, id, evmAddress)
      .then(() => {
        ElMessage.success(t('success'))
        getTokenCheckFavoriteGroup()
      })
      .catch((err) => {
        console.log(err)
        ElMessage.error(t('fail'))
      })
      .finally(() => {
        loadingGroupEdit.value = false
        editableGroup.value = false
      })
  } else {
    loadingGroupEdit.value = false
    editableGroup.value = false
  }
}
function handleReset() {
  if (editableGroup.value) {
    editableGroup.value = false
    selectedGroup.value = groupId.value
  }
  if (editableRemark.value) {
    editable2 = false
    remark2.value = remark.value
  }
}
function confirmEditRemark(remark, tokenId, evmAddress) {
  if (evmAddress) {
    return
  }
  if (remark?.length > 50) {
    return this.$message.error(this.$t('maximum10characters'))
  }
  editTokenFavRemark(tokenId, remark, evmAddress)
    .then(() => {
      ElMessage.success(this.$t('success'))
      remark2.value = remark
    })
    .catch((err) => {
      console.log(err)
      tElMessage.error(this.$t('fail'))
    })
    .finally(() => {
      this.editableRemark = false
    })
}

function getTags(i) {
  let signal_arr = []
  let normal_tag = []
  if (i?.dynamic_tag) {
    const tag_arr = JSON.parse(i?.dynamic_tag) || []
    signal_arr = tag_arr?.filter((i) => i?.startsWith('signal'))
    signal_arr = signal_arr?.map((y) => ({
      tag:
        y?.split('-')[5] &&
        (y?.split('-')[1] == 'whale_sell' || y?.split('-')[1] == 'whale_buy')
          ? `${y?.split('-')[1]}_trump`
          : y?.split('-')[1],
      color: y?.split('-')[2],
      n: y?.split('-')[3],
      timestamp: y?.split('-')[4],
    }))
    signal_arr?.sort((a, b) => b.timestamp - a.timestamp)
    const kol_arr = signal_arr.filter(
      (item, index) =>
        signal_arr.findIndex((el) =>
          new RegExp('^kol_.*$', 'gi').test(el.tag)
        ) == index
    )
    const dev_arr = signal_arr.filter(
      (item, index) =>
        signal_arr.findIndex((el) =>
          new RegExp('^dev_.*$', 'gi').test(el.tag)
        ) == index
    )
    const smarter_arr = signal_arr.filter(
      (item, index) =>
        signal_arr.findIndex((el) =>
          new RegExp('^smarter_.*$', 'gi').test(el?.tag)
        ) == index
    )
    const whale_arr = signal_arr.filter(
      (item, index) =>
        signal_arr.findIndex((el) =>
          new RegExp('^whale_.*$', 'gi').test(el.tag)
        ) == index
    )
    const other_arr = signal_arr?.filter(
      (el) => !new RegExp('^dev_|kol_|smarter_|whale_.*$', 'gi').test(el.tag)
    )
    signal_arr = kol_arr
      ?.concat(dev_arr)
      ?.concat(smarter_arr)
      ?.concat(whale_arr)
      ?.concat(other_arr)
    signal_arr?.sort((a, b) => b.timestamp - a.timestamp)
    normal_tag = tag_arr.filter((i) => !i?.startsWith('signal'))
  }
  if (i?.tag) {
    const tag = i.tag?.split(',') || []
    const tag1 = tag.filter((i) => i !== 'pump' && i !== 'moonshot') || []
    normal_tag = tag1.concat(normal_tag)
  }
  normal_tag =
    normal_tag?.map((i) => ({
      tag: i,
      color: 'green',
      showText: false,
    })) || []
  const is_rug_pull =
    signal_arr?.some((i) => new RegExp('rug_pull', 'gi').test(i?.tag)) ||
    normal_tag?.some((i) => new RegExp('rug_pull', 'gi').test(i?.tag))
  const is_shit_coins =
    signal_arr?.some((i) => new RegExp('shitcoin', 'gi').test(i?.tag)) ||
    normal_tag?.some((i) => new RegExp('shitcoin', 'gi').test(i.tag))
  if (i?.risk_score >= 100 && i?.chain == 'solana') {
    i.lp_locked_percent = 0
    signal_arr = []
    normal_tag = [
      {
        tag: 'flag_dangerous',
        color: 'red',
        showText: true,
      },
    ]
  } else if (is_rug_pull) {
    i.lp_locked_percent = 0
    signal_arr = []
    normal_tag = [
      {
        tag: 'flag_rug_pull',
        color: 'red',
        showText: true,
      },
    ]
  } else if (is_shit_coins) {
    i.lp_locked_percent = 0
    signal_arr = []
    normal_tag = [
      {
        tag: 'flag_shit_coins',
        color: 'red',
        showText: true,
      },
    ]
  }

  if (token?.value?.tag) {
    const tagti = token?.value?.tag?.split(',') || []
    let tag_t = tagti?.filter((i) => i !== '' && i !== 'newcommunity')
    tag_t = tag_t?.map((i) => ({
      tag: i,
      color: 'green',
      showText: false,
    }))
    normal_tag = tag_t.concat(normal_tag)
  }
  const extra_tag = token?.value?.tag?.split(',') || []
  const newcommunity = extra_tag?.includes?.('newcommunity')
  // if(extra_tag?.length >0){
  //   extra_tag = extra_tag?.map(i => ({
  //     tag: i,
  //     color: 'green',
  //     showText: false
  //   }))
  //   if (normal_tag?.length > 0) {
  //     normal_tag = normal_tag?.concat(extra_tag)
  //   } else {
  //     normal_tag = extra_tag
  //   }
  // }
  if (token?.value?.cto_flag == 1 || newcommunity) {
    normal_tag.unshift({
      tag: 'cto_flag',
      color: 'green',
      showText: false,
    })
  }
  return {
    normal_tag,
    signal_arr,
  }
}
function getTagTooltip(i) {
  if (!i.tag) {
    if (i.smart_money_buy_count_24h > 0 || i.smart_money_sell_count_24h > 0) {
      return t('smart_money_tips', {
        b: i.smart_money_buy_count_24h,
        s: i.smart_money_sell_count_24h,
      })
    }
    return ''
  }
  const tips = {
    kol_sell: t('kol_sell_tips'),
    kol_buy: t('kol_buy_tips'),
    smarter_buy: t('smarter_buy_tips'),
    smarter_sell: t('smarter_sell_tips'),
  }
  return tips?.[i.tag] || t(i.tag)
}
</script>

<style scoped lang="scss">
.token-info {
  .token-icon {
    height: 40px;
    width: 40px;
  }
  .icon-symbol {
    width: 20px;
    position: absolute;
    bottom: 3px;
    right: 0px;
  }
}
.bg-btn {
  --uno: bg-[--d-222-l-F2F2F2] rounded-2px mr-4px flex items-center
    justify-center h-16px min-w-16px p-2px;
}
</style>
