<template>

    <div class="pop-right">
      <div
        class="content"
        style="flex: 1; max-width: 450px; overflow-x: hidden;"
      >
        <div class="right-container run">
          <div class="sticky">
            <div class="flex-between">
              <span class="font-16 font_weight_500">{{ $t('flag_rug_pull') }}</span>
              <a href="" class="color-999 font-20" >
                <i class="iconfont icon-_28-Arrows1 font-20"></i>
              </a>
            </div>
            <div class="mt_20 flex-between" v-if="rugPull?.all_tag_rate >0">
              <span class="font-14 font_weight_500">
                {{ $t('abnormalChips') }}：{{ $f.formatNumber2(rugPull?.all_tag_rate || 0, 1) }}%
              </span>
              <el-tooltip effect="customized" placement="top">
                <template #content>{{ $t('abnormalChipsTip') }}</template>
                <i class="iconfont icon-jiancexiang font-14 ml-5" style="color: #959a9f"></i>
              </el-tooltip>
            </div>
            <el-row :gutter="10" v-if="rugPull?.all_tag_rate >0">
              <el-col :span="12" class="mt_10" v-for="(item, $index) in rugPull?.rateList" :key="$index">
                <div class="item flex-start">
                  <span class="flex-start color-999 font-12" style="width: 66px">
                    <img style="width: 12px;margin-right:2px" :src="$f.formatNewTags(item.icon)" alt="" />
                    {{ item?.title?.[firstCharacterToupperCase(language?.replace?.('zh-cn', 'Cn')?.replace?.('zh-tw', 'Tw'))] || item?.En }}:
                  </span>
                  <div class="flex-end">
                    <el-progress
                      class="run-progress-bar ml-5"
                      :percentage="item.rate || 0"
                      :stroke-width="4"
                      color="#F6465D"
                      :show-text="false"
                      style="width: 20px"
                    />
                    <span class="ml-5 font-12">
                      {{ $f.formatNumber2(item.rate || 0, 1) }}%
                    </span>
                  </div>
                </div>
              </el-col>
            </el-row>

            <div class="mt_20 flex-between" style="padding-bottom: 10px">
              <span class="font-14 font_weight_500">
                {{ $t('runPullHistory') }}：<template v-if="rugPull?.rates?.total">
                  <span class="font-12" :style="!ruggedColor?{}:{color:ruggedColor}">{{ $f.formatNumber2(rugPull?.rates?.rugged || 0, 0)}}</span><span class="font-12">/{{$f.formatNumber2(rugPull?.rates?.total || 0, 0)}}</span>
                </template>
              </span>
              <div class="flex-end" v-if="rugPull?.dev">
                <span class="color-999 font-12">{{ $t('devAddress') }}：</span>
                <a href @click.stop.prevent="jumpBalance" target="_blank" class="color-999 font-12 text-underline" >
                  {{ rugPull?.dev?.slice(0, 4) + '...' + rugPull?.dev?.slice(-4) }}
                </a>
              </div>
            </div>
            <div class="top">
              <span class="flex-start">{{ $t('tokenMethod') }}</span>
              <span>{{ $t('runPullTime') }}</span>
              <div>
                <span>{{ $t('time') }}</span>
                <i
                  v-show="isShowDate"
                  class="iconfont icon-riqi clickable text-12px ml-3"
                  @click.stop="isShowDate = false"
                ></i>
                <i
                  v-show="!isShowDate"
                  class="iconfont icon-countdown clickable text-12px ml-3"
                  @click.stop="isShowDate = true"
                ></i>
              </div>
              <span></span>
            </div>
          </div>
          <div class="relative">
            <ul class="content"
              v-if="$store.state.runVisible"
              v-infinite-scroll="getRugPullList"
              :infinite-scroll-disabled="loadingRun || finished"
              :infinite-scroll-distance="500"
              :infinite-scroll-delay="10"
              :infinite-scroll-immediate="true"
              >
              <li
                v-for="(row, $index) in tableList"
                class="flex"
                :key="$index"
                @click.stop="tableRowClick(row)"
              >
                <div
                  class="token-info table-item_d"
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                  @click.stop.prevent="tableRowClick(row)"
                >
                  <div class="icon-token-container" style="margin-right: 10px">
                    <el-image class="token-icon" :src="$f.formatIcon(row, row.Symbol)">
                      <template #error>
                        <div
                          class="token-icon"
                          style="
                            line-height: 32px;
                            text-align: center;
                            font-size: 16px;
                            color: #fff;
                          "
                          :style="{ background: $f.getChainDefaultIconColor(row?.Chain) }"
                        >
                          {{ row.Symbol?.slice(0, 1)?.toUpperCase?.() || '' }}
                        </div>
                      </template>
                      <template #placeholder>
                        <div
                          class="token-icon"
                          style="
                            line-height: 32px;
                            text-align: center;
                            font-size: 16px;
                            color: #fff;
                          "
                          :style="{ background: $f.getChainDefaultIconColor(row?.Chain) }"
                        >
                          {{ row.symbol?.slice(0, 1)?.toUpperCase?.() || '' }}
                        </div>
                      </template>
                    </el-image>
                    <img
                      v-if="row?.network || row?.Chain"
                      class="icon-svg icon-symbol"
                      :src="`${$store.state.s3BaseUrl}chain/${row.Chain}.png`"
                      alt=""
                      onerror="this.src='/icon-default.png'"
                      srcset=""
                    />
                  </div>
                  <div @click.stop>
                    <div class="flex-start">
                      <span class="token-symbol ellipsis">
                        {{ row.Symbol }}
                      </span>
                      <i
                        class="iconfont icon-copy font_12 ml-2"
                        @click.stop.prevent
                        v-copy="row.Token"
                      ></i>

                      <a
                        class="media-item ml-2 font_10"
                        :href="`https://x.com/search?q=($${row.Symbol} OR ${row.token})&src=typed_query&f=live`"
                        target="_blank"
                      >
                        <i class="iconfont icon-search font_10"></i>
                      </a>

                      <div class="media-list flex-start font_12" v-if="row?.medias?.length > 0" @click.stop>
                        <template v-for="(item, index) in row?.medias" :key="index">
                          <div
                            class="ml-2"
                            v-if="item.url"
                            v-tooltip=" item.url"
                          >
                            <span class="media-item" v-if="item.name === 'QQ'">
                              <i class="iconfont icon-QQ font_12"></i>
                            </span>

                            <a
                              class="media-item font_12"
                              :href="item.url"
                              target="_blank"
                              v-else
                            >
                              <i class="iconfont font_12" :class="`icon-${item.icon}`"></i>
                            </a>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div class="font-1 mt-2 flex-start" style="min-width: 110%">
                      <span
                        class="mini font-10"
                        :style="{ color: filterType(row.RunAwayType).color }"
                      >
                        {{ filterType(row.RunAwayType).text }}
                      </span>
                    </div>
                  </div>
                </div>
                <span>
                  {{
                    row.DevRunAwayTime - row.PublishAt > 0
                      ? $f.formatTime2(row.DevRunAwayTime - row.PublishAt)
                      : '--'
                  }}
                </span>
                <!-- <van-count-down
                  v-if="
                    !isShowDate && row?.PublishAt && $f.formatTimeFromNow(row?.PublishAt, true) < 60
                  "
                  :time="(60 - $f.formatTimeFromNow(row?.PublishAt, true)) * 1000"
                  style="
                    --van-count-down-text-color: currentColor;
                    --van-count-down-line-height: 1;
                    --van-count-down-font-size: 13px;
                  "
                  :key="row?.PublishAt"
                >
                  <template #default="{ total }">
                    <template v-if="total > 0">
                      {{ Math.floor((60 * 1000 - total) / 1000) }} {{ $t('ss') }}
                    </template>
                    <template v-else>
                      {{ $dayjs(row?.PublishAt * 1000).fromNow() }}
                    </template>
                  </template>
                </van-count-down>
                <span v-else>
                  {{
                    isShowDate
                      ? $f.formatDate(row.PublishAt, 'YYYY-MM-DD HH:mm:ss')
                      : $dayjs(row?.PublishAt * 1000).fromNow()
                  }}
                </span> -->
                <div class="flex-end">
                  <a class="a-gray font-16" href="" @click.stop.prevent="goLink(row)">
                    <i class="iconfont icon-a-sol-dark font-16"></i>
                  </a>
                </div>
              </li>
            </ul>
            <div class="font-12 tc width100"  :style="{color: $store.state.mode === 'light' ? '#666' : '#999'}" >
              <span v-if="loadingRun && pageNO > 1">{{ $t('loading') }}</span>
              <span v-if="finished && pageNO > 1 && tableList?.length > pageSize">{{ $t('noMore') }}</span>
            </div>
            <el-empty
              v-if="(!tableList || tableList?.length === 0) && !loadingRun"
              :image-size="100"
              :image="themeStore.theme === 'light' ? emptyWhite : emptyDark"
            ></el-empty>
          </div>
        </div>
      </div>
    </div>
  </template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import emptyWhite from '@/assets/images/empty-white.svg'
import emptyDark from '@/assets/images/empty-black.svg'
// import { CountDown } from 'vant'
import BigNumber from 'bignumber.js'
import { _getRugPullList } from '@/api/run'
import { isJSON , getAddressAndChainFromId} from '@/utils/index'
const props= defineProps({
    obj: null,
})


const themeStore = useThemeStore()
const isShowDate = ref(false)
const tableList = ref<any[]>([])
const pageNO = ref(1)
const pageSize = ref(20)
const loadingRun = ref(false)
const finished = ref(false)

const route = useRoute()
const router = useRouter()
const id= route.params.id

const rugPull = computed(() => props.obj)
const localeStore = useLocaleStore()
const language= computed(()=>{
    return language?.value?.locale
})

const chain = computed(() => {
  const { chain } = getAddressAndChainFromId(id, 0)
  return chain
})

const ruggedColor = computed(() => {
  const data = rugPull.value?.rates?.total
  if (typeof data === 'string' || typeof data === 'number') {
    const value = new BigNumber(data)
    if (value.lte(2) && value.gt(0)) {
      return false
    } else if (value.lte(10) && value.gt(2)) {
      return '#FFA622'
    } else if (value.gt(10)) {
      return '#F6465D'
    }
  }
  return false
})

watch(() => id, (val) => {
  if (val) {
    tableList.value = []
    pageNO.value = 1
    pageSize.value = 20
    loadingRun.value = false
    finished.value = false
  }
})

function firstCharacterToupperCase(str: string): string {
  return str.replace(/^\S/, match => match.toUpperCase())
}

function filterType(type: string) {
  const obj: Record<string, any> = {
    shitcoin: {
      text: 'shitcoin',
      color: '#F6465D'
    },
    unknown: {
      text: 'unKnown',
      color: '#F6465D'
    }
  }
  return obj[type] || ''
}

function goLink(item: any) {
  window.open((router as any).formatExplorerUrl(item.chain, item.token))
}

function tableRowClick(item: any) {
  router.push({ name: 'Token', params: { id: `${item.Token}-${item.chain}` } })
}

function jumpBalance() {
  const targetRoute = router.resolve({
    name: 'Balance',
    params: { chain: chain.value, userAddress: rugPull.value?.dev },
    query: { from: route.name as string }
  })
  window.open(targetRoute.href, '_blank')
}

function getMedias(appendix: string): Array<{ name: string, icon: string, url: string }> {
  if (!appendix || !isJSON(appendix)) return []
  const obj = JSON.parse(appendix)
  const arr = []
  if (obj?.website) arr.push({ name: 'Website', icon: 'web', url: (router as any).formatUrl(obj.website) })
  if (obj?.btok) arr.push({ name: 'Btok', icon: 'Btok', url: (router as any).formatUrl(obj.btok) })
  if (obj?.qq) arr.push({ name: 'QQ', icon: 'QQ', url: obj.qq })
  if (obj?.telegram) arr.push({ name: 'Telegram', icon: 'TG', url: (router as any).formatUrl(obj.telegram) })
  if (obj?.twitter) arr.push({ name: 'Twitter', icon: 'twitter2', url: (router as any).formatUrl(obj.twitter) })
  return arr
}

async function fetchRugPullList() {
  if (loadingRun.value) return
  loadingRun.value = true
  try {
    const data = {
      token_id: id,
      pageNO: pageNO.value,
      pageSize: pageSize.value
    }
    const res = await _getRugPullList(data)
    if (pageNO.value === 1) tableList.value = []

    const list = res?.dev_stats?.map((i: any) => ({
      ...i,
      chain: i.Chain,
      symbol: i.Symbol,
      token: i.Token,
      logo_url: i.LogoURL || '',
      medias: getMedias(i.Appendix),
      DevRunAwayTime: (i?.DevRunAwayTime !== '1970-01-01T00:00:00Z' && i?.DevRunAwayTime !== '0001-01-01T00:00:00Z')
        ? new Date(i.DevRunAwayTime).getTime() / 1000 : 0,
      PublishAt: (i?.PublishAt !== '1970-01-01T00:00:00Z' && i?.PublishAt !== '0001-01-01T00:00:00Z')
        ? new Date(i.PublishAt).getTime() / 1000 : 0
    })) || []

    tableList.value.push(...list)
    if (list.length < pageSize.value) {
      finished.value = true
    } else {
      pageNO.value++
    }
  } catch (err) {
    console.error(err)
    finished.value = true
  } finally {
    loadingRun.value = false
  }
}

onMounted(() => {
  fetchRugPullList()
})
</script>


  <style lang="scss" scoped>
  .run {
    color: var(--custom-font-1-color);
    font-family: PingFang SC;
    .top {
      // background: var(--custom-table-th-bg-color);
      color: var(--custom-text-2-1-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0px 8px;
      font-size: 12px;
      > :nth-child(n) {
        padding: 0 0px;
        &:first-child {
          padding-left: 0;
          // align-items: flex-start;
        }
        &:last-child {
          padding-right: 0;
        }
      }
      > :nth-child(1) {
        flex: 2.5;
        white-space: nowrap;
      }
      > :nth-child(2) {
        flex: 1;
        text-align: right;
        white-space: nowrap;
      }
      > :nth-child(3) {
        flex: 1.5;
        text-align: right;
      }
      > :nth-child(4) {
        width: 20px;
        text-align: right;
      }
    }
    .content {
      padding-bottom: 10px;
      color: #959A9F;
      // font-weight: 400;
      font-size: 11px;
      > .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        > :nth-child(n) {
          // display: flex;
          // flex-direction: column;
          // align-items: flex-end;
          // justify-content: center;
          // color: var(--custom-text-2-color);
          padding: 12px 0px;
          &:first-child {
            // align-items: flex-start;
          }
          &:last-child {
            padding-right: 0px;
          }
        }
        > :nth-child(1) {
          flex: 2.5;
        }
        > :nth-child(2) {
          flex: 1;
          text-align: right;
        }
        > :nth-child(3) {
          flex: 1.5;
          text-align: right;
        }
        > :nth-child(4) {
          width: 20px;
          text-align: right;
        }
        cursor: pointer;
        &:hover {
          background-color: var(--custom-table-hover-bg-color);
        }
      }
      .green {
        color: #12b886;
      }
      .red {
        color: #ff646d;
      }
      .color-add {
        color: #65c4ed;
      }
      .color-remove {
        color: #ef6de2;
      }
      .unit {
        margin-left: 5px;
        color: var(--custom-text-2-1-color);
      }
    }
    .text-underline {
      text-decoration: underline;
    }
  }
  .token-info {
    display: flex;
    .icon-token-container {
      margin-right: 4px;
      .icon-symbol {
        left: 15px;
        top: 15px;
      }
    }
  }
  .icon-copy{
   color: var(--custom-text-2-color)
  }
  .pop-right{
      background: var(--custom-bg-1-color);
    .right-container{
      padding-top: 0;
      border-radius: 0;
      background: var(--custom-bg-1-color);
      min-height: auto;
      // overflow-y: scroll;
      // overflow-x: hidden;
    }
  }
  .ellipsis{
    max-width: 60px;
  }
  .sticky{
    position: sticky;
    top:0px;
    padding-top: 20px;
    background: var(--custom-bg-1-color);
    z-index:2
  }
  </style>
