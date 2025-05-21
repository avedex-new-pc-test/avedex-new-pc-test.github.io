<template>
  <el-popover
    v-if="list?.length > 0"
    v-model:visible="show"
    placement="bottom"
    popper-class="chains-table-filter"
    title=""
    :width="325"
    trigger="hover"
  >
    <template #reference>
      <a class="ml-5 top50" href="" @click.stop.prevent>
        <!-- <i class="iconfont icon-TOP font-12 mr-2px" /> -->
        <Icon name="custom:top" class="text-[--d-666-l-999] h-12px mr-2px" />
        <span
          :class="{
            text:
              (list?.filter(
                (i) => i?.tag_type == 4 || i?.tag_type == 1 || i?.tag_type == 2
              )?.length || 0) /
                Math.min(list?.length || 50) >
              1 / 3,
          }"
        >
          {{
            list?.filter(
              (i) => i?.tag_type == 4 || i?.tag_type == 1 || i?.tag_type == 2
            )?.length || 0
          }}
        </span>
        /{{ Math.min(list?.length || 50) }}
        <i class="iconfont icon-youjiantou" />
      </a>
    </template>
    <template #default>
      <div class="filter-box">
        <div class="flex-start">
          <span class="font_18 title">{{
            list[0]?.tag == 'early' ? t('top50TitleHold') : t('top50TitleEarly')
          }}</span>
          <el-tooltip
            v-if="list[0]?.tag == 'early'"
            effect="customized"
            placement="top"
          >
            <template #content>{{ t('top50TitleTip') }}</template>
            <i
              class="iconfont icon-jiancexiang font-14 ml-5"
              style="color: #959a9f; margin-top: 2px"
            />
          </el-tooltip>
        </div>
        <div class="border mt_20">
          <div class="holder">
            <div v-for="(item, $index) in list" :key="$index">
              <el-tooltip
                v-if="filterTag(item.tag_type)"
                effect="customized"
                placement="top"
                :hide-after="0"
              >
                <template #content>
                  {{ filterTag(item.tag_type)?.text }}
                </template>
                <a href="" @click.stop.prevent="jumpBalance(item)">
                  <div class="item">
                    <!-- <i
                      class="dot iconfont"
                      :class="filterTag(item.tag_type)?.icon"
                      :style="{ color: filterTag(item.tag_type)?.color }"
                    /> -->
                    <Icon
                      class="dot iconfont font-10 mr-5 color-red-6"
                      :name="filterTag(item.tag_type)?.icon"
                      :style="{ color: filterTag(item.tag_type)?.color }"
                    />
                    <img
                      v-if="item?.new_tags?.length > 0"
                      style="max-width: 10px; max-height: 10px"
                      class="mr-3"
                      :src="formatNewTags(item.new_tags[0]?.icon)"
                      alt=""
                    />
                  </div>
                </a>
              </el-tooltip>
            </div>
          </div>
          <div class="flex-between mt_10">
            <div>
              <div class="flex-start mt_10">
                <!-- <i
                  class="dot iconfont font-10 mr-5"
                  :class="filterTag(1)?.icon"
                  :style="{ color: filterTag(1)?.color }"
                /> -->
                <Icon
                  class="dot iconfont font-10 mr-5 color-red-6"
                  :name="filterTag(1)?.icon"
                  :style="{ color: filterTag(1)?.color }"
                />
                {{ t('top50Holders') }}：{{
                  list?.filter((i) => i.tag_type == 1)?.length || 0
                }}
              </div>
              <div class="flex-start mt_10">
                <!-- <i
                  class="dot iconfont font-10 mr-5"
                  :class="filterTag(3)?.icon"
                  :style="{ color: filterTag(3)?.color }"
                /> -->
                <Icon
                  class="dot iconfont font-10 mr-5 color-red-6"
                  :name="filterTag(3)?.icon"
                  :style="{ color: filterTag(3)?.color }"
                />
                {{ t('top50SSoldOut') }}：{{
                  list?.filter((i) => i.tag_type == 3)?.length || 0
                }}
              </div>
            </div>
            <div>
              <div class="flex-start mt_10">
                <!-- <i
                  class="dot iconfont font-10 mr-5"
                  :class="filterTag(2)?.icon"
                  :style="{ color: filterTag(2)?.color }"
                /> -->
                <Icon
                  class="dot iconfont font-10 mr-5 color-red-6"
                  :name="filterTag(2)?.icon"
                  :style="{ color: filterTag(2)?.color }"
                />
                {{ t('top50Increase') }}：{{
                  list?.filter((i) => i.tag_type == 2)?.length || 0
                }}
              </div>
              <div class="flex-start mt_10">
                <Icon
                  class="dot iconfont font-10 mr-5 color-red-6"
                  :name="filterTag(4)?.icon"
                  :style="{ color: filterTag(4)?.color, 'margin-top': '2px' }"
                />
                {{ t('top50PartialSale') }}：{{
                  list?.filter((i) => i.tag_type == 4)?.length || 0
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex-start mt_20">
          <img
            src="@/assets/images/avedex_mobile_logo.png"
            style="height: 17px"
            height="17"
            alt=""
            srcset=""
          />
          <span class="ml-5 font-14">Ave.ai</span>
        </div>
        <span class="mt_5 block" style="font-size: 10px; color: #959a9f">
          {{ t('campaignTitle') }}
        </span>
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { _getEarlyholders, type EarlyHolders } from '@/api/top50'
import { formatNewTags } from '@/utils/index'
const { t } = useI18n()
const route = useRoute()
const id = route.params?.id as string
const show = shallowRef(false)
const list = shallowRef<EarlyHolders>([])
// watch(id, () => {
//   getEarlyhidolders()
// })
onMounted(() => {
  getEarlyholders()
})

function jumpBalance() {
  //   const { chain } =
  //     this.$f.getAddressAndChainFromId(this.$route.params.id) ||
  //     this.$store.state.tokenInfo?.chain
  //   const targetRoute = this.$router.resolve({
  //     name: 'Balance',
  //     params: { chain: chain, userAddress: row.account_address },
  //     query: { from: this.$route.name },
  //   })
  //   window.open(targetRoute.href, '_blank')
}
function filterTag(type) {
  const obj = {
    1: {
      color: '#12B886',
      icon: 'custom-top50Holders',
      text: t('top50Holders'),
    },
    2: {
      color: '#00B00F',
      icon: 'custom-top50Holders',
      text: t('top50Increase'),
    },
    3: {
      color: '#F6465D',
      icon: 'custom-top50SSoldOut',
      text: t('top50SSoldOut'),
    },
    4: {
      color: '#F6465D',
      icon: 'custom-top50SSoldOut',
      text: t('top50PartialSale'),
    },
  }
  return obj[type] || ''
}
function getEarlyholders() {
  _getEarlyholders(id)
    .then((res) => {
      const a = Array.isArray(res) ? res?.slice(0, 50) : []
      list.value = a?.map((i) => ({
        ...i,
        new_tags: i.new_tags?.filter(
          (y) => y.type == 25 || y.type == 30 || y.type == 31
        ),
      }))
      console.log('------list------', list)
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {})
}
</script>

<style lang="scss" scoped>
.top50 {
  font-size: 12px;
  color: var(--custom-text-2-color);
  display: flex;
  background: var(--custom-bg-7-color);
  border-radius: 2px;
  margin-left: 5px;
  padding: 2px;
  line-height: 1;
  min-width: 18px;
  min-height: 18px;
  align-items: center;
  justify-content: center;

  .text {
    color: var(--custom-font-1-color);
    margin-left: 3px;
  }
  .icon-youjiantou {
    margin-left: 2px;
    font-size: 8px;
  }
}
.filter-box {
  padding: 10px 0;
}
.border {
  border-top: 0.5px solid var(--custom-border-4-color);
  border-bottom: 0.5px solid var(--custom-border-4-color);
  padding: 22px 0 30px;
}
.holder {
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-right: -5px;
  .item {
    padding: 8px 5px;
    position: relative;
    img {
      position: absolute;
      // transform: translate(-50%, -50%);
      // top: 50%;
      // left: 50%;
      top: 17px;
      right: 0px;
    }
    .dot {
      font-size: 20px;
      width: 20px;
      height: 20px;
      border-radius: 100%;
      line-height: 1;
      //   background: #12b886;
    }
  }
}
</style>
