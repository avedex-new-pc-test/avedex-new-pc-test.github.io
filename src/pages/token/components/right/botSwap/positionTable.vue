<template>
  <div>
    <!-- hide_risk:{{ tableFilter['hide_risk'] }}
    hide_small:{{ tableFilter['hide_small'] }} -->
    <!-- holderList:{{ JSON.stringify(holderList) }} -->
      <div class='tabs'>
        <el-checkbox
          style="--el-checkbox-text-color: var(--a-text-2-color);--el-checkbox-checked-text-color: var(--a-text-2-color);--el-checkbox-checked-bg-color: var(--a-text-1-color);--el-checkbox-checked-input-border-color: var(--a-text-1-color);--el-checkbox-checked-icon-color: var(--a-bg-4-color);"
          v-model="tableFilter['hide_risk']" size="small" :true-value="1" :false-value="0">
          {{ $t('hideRiskTokenShort') }}
        </el-checkbox>
        <!-- @change="handlerCheckBox('hide_small')" -->
        <el-checkbox v-model="tableFilter['hide_small']" size="small" :true-value="1" :false-value="0"
          style="--el-checkbox-text-color: var(--a-text-2-color);--el-checkbox-checked-text-color: var(--a-text-2-color);--el-checkbox-checked-bg-color: var(--a-text-1-color);--el-checkbox-checked-input-border-color: var(--a-text-1-color);--el-checkbox-checked-icon-color: var(--a-bg-4-color);margin-right: 30px;">
          {{ $t('hideSmallAssets1') + '<1USD' }} </el-checkbox>
       <netSelect v-if="currentAccount && ($store.state.wallet!='importAddress')" :handleFilterConfirm="val=>netSelectConfirm(val)" :storage="'tableFilter2-'+currentAccount" key="tableFilter2"/>
      </div>
      <!-- <el-scrollbar>
      </el-scrollbar> -->
      <el-table
        class="table-position"
        :data="holderList"
        fit
        stripe
        :height="400"
        @row-click="row => {$router.push({name: 'Token', params: {id: row.token + '-' + row.chain}});$emit('changeToken')}"
        >
        <template #empty>
          <div class="table-empty" v-if="!loading">
            <img
              :src="
                $store.state.mode === 'light'
                  ? require('@/assets/images/empty-white.svg')
                  : require('@/assets/images/empty-black.svg')
              "
            />
            <span>{{ $t('emptyNoData') }}</span>
          </div>
          <span v-else>
            <loading v-model:active="loading" :can-cancel="false" loader="dots" :opacity="0.2"
              :backgroundColor="$store.state.mode === 'light' ? '#F5F5F5' : '#131722'" color="#3F80F7" :is-full-page="false">
            </loading>
          </span>
        </template>
        <el-table-column :label="$t('token')" align="left">
          <template #default="{ row }">
            <div class="flex-start ellipsis">
              <div class="icon-token-container" style="margin-right: 5px">
                <el-image class="token-icon" :src="$f.formatIcon(row, row.symbol)">
                  <template #error>
                    <img class="token-icon" :src="$f.formatIcon(row?.chain, row.symbol)" alt="" srcset="">
                  </template>
                  <template #placeholder>
                    <img class="token-icon" :src="$f.formatIcon(row?.chain, row.symbol)" alt="" srcset="">
                  </template>
                </el-image>
                <img
                  v-if="row?.chain"
                  class="icon-svg icon-symbol"
                  :src="`${$store.state.s3BaseUrl}chain/${row.chain}.png`"
                  alt=""
                  onerror="this.src='/icon-default.png'"
                  srcset=""
                />
              </div>
              <span class="token-symbol clickable">{{ row.symbol}}</span>
              <i v-if="row?.token === token && isShowTop" class="iconfont icon-zhiding ml-5 text-12px" style="color: #F0B90A;"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('balance1')" align="right">
          <template #default="{ row }">
            <span>${{ $f.formatNumber2(row?.balance_usd || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('amount')" align="right"  >
          <template #default="{ row }">
            <span>{{ $f.formatNumber2(row?.balance || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('costPrice')" align="right">
          <template #default="{ row }">
            <span v-if="row?.average_purchase_price_usd=='--'">--</span>
            <span v-else>${{ $f.formatNumber2(row?.average_purchase_price_usd || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('currentPrice')" align="right">
          <template #default="{ row }">
            <span>${{ $f.formatNumber2(row?.current_price_usd || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="PnL" align="right">
          <template #header>
            <div style="display: inline-flex; align-items: center;justify-content: flex-end;padding-right: 10px;">
              <span>PnL</span>
              <el-tooltip
                effect="customized"
                placement="top-end"
                :popper-class="$store.state.mode"
                :content="$t('PnLTips')"
              >
                <el-icon style="cursor: pointer; font-size: 14px; margin-left: 2px;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: inline-flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
              <span v-if="row?.total_profit_ratio" :style="{ color: row?.total_profit_ratio > 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">{{ row?.total_profit_ratio=='--'?'--':$f.formatNumberS(row?.total_profit_ratio * 100 || 0 ,2, 4, 4)+'%' }}</span>
              <span v-else>--</span>
              <i style="cursor: pointer; font-size: 14px; color: var(--custom-text-2-color)" class="iconfont icon-fenxiangtubiao ml-5 clickable" @click.stop="openDialog(row)"></i>
            </div>
          </template>
        </el-table-column>
        <template #append>
          <div style="font-size: 0; line-height: 0;height: 0;"
            v-infinite-scroll="getUserBalanceList"
            :infinite-scroll-disabled="balancePage.loaded || balancePage.finished"
            :infinite-scroll-distance="0"
            :infinite-scroll-delay="200"
            :infinite-scroll-immediate="true"
          ></div>
            <div v-if="balancePage.loaded && holderList?.length > 0"  style="text-align: center; padding:  15px 0 10px; font-size: 12px; color: #959a9f;">{{ $t('loading') }} </div>
            <div v-else-if="balancePage.finished && holderList?.length > 0"  style="text-align: center; padding: 15px 0 10px; font-size: 12px; color: #959a9f;">{{ $t('noMore') }}</div>
        </template>
    </el-table>
    <el-dialog
      class="dialog-share"
      v-model="dialogVisible"
      :title="$t('share')"
      width="700"
      append-to-body
    >
      <div class="content">
        <div class="share-card" :style="{background: shareItem?.total_profit_ratio > 0 ? 'linear-gradient(146.57deg, #003A29 0.8%, #000000 98.72%)' : 'linear-gradient(145.74deg, #49000A 0.79%, #000000 100%)'}">
          <!-- <img class="share-bg-img" :style="{opacity: bgImg === i ? '1' : '0'}" v-for="(i, index) in allImg" :key="index" :src="i" alt="" srcset=""> -->
          <img class="share-bg-img" :src="bgImg" alt="" srcset="">
          <div style="display: inline-block">
            <div class="flex" style="flex-direction: column">
              <div class="flex-start">
                <img src="@/assets/images/avedex_mobile_logo.png" style="height: 24px;" height="24" alt="" srcset="">
                <span class="ml-5 text-20px">Ave.ai</span>
              </div>
              <span class="mt_5 block" style="margin-left: auto;font-size: 10px;color: #fff;max-width: 180px; text-align: center">{{ $t('campaignTitle') }}</span>
            </div>
          </div>
          <div class="flex-start mt-40">
            <div class="icon-token-container share" style="margin-right: 10px">
              <el-image class="token-icon token-logo" :src="$f.formatIcon(shareItem, shareItem.symbol)">
                <template #error>
                  <img class="token-icon" :src="$f.formatIcon(shareItem?.chain, shareItem.symbol)" alt="" srcset="">
                </template>
                <template #placeholder>
                  <img class="token-icon" :src="$f.formatIcon(shareItem?.chain, shareItem.symbol)" alt="" srcset="">
                </template>
              </el-image>
              <img
                v-if="shareItem?.chain"
                class="icon-svg icon-symbol chain-logo"
                :src="logoChainBase64 || `${$store.state.s3BaseUrl}chain/${shareItem.chain}.png`"
                alt=""
                onerror="this.src='/icon-default.png'"
                srcset=""
              />
            </div>
            <span class="text-20px">{{ shareItem.symbol }}</span>
          </div>
          <div class="mt_15">
            <span class="color-999">{{ $t('RIO') }}</span>
            <div class="mt_5" style="font-size: 40px; font-weight: 700;" v-if="shareItem?.total_profit_ratio" :style="{ color: shareItem?.total_profit_ratio > 0 ? $store.getters.upColor[3] : $store.getters.downColor[3] }">{{ shareItem?.total_profit_ratio > 0 ? '+' : '' }}{{ shareItem?.total_profit_ratio=='--'?'--':$f.formatNumberS(shareItem?.total_profit_ratio * 100|| 0 ,2, 4, 4)+'%' }}</div>
            <div class="mt_5" style="font-size: 40px; font-weight: 700;" v-else :style="{ color: '#999' }">--</div>
          </div>
          <table class="mt-20 share-table">
            <tbody>
              <tr>
                <td :style="{width: ($f.getTextWidth($t('profit')) + 20 + 'px')}">{{ $t('profit') }}</td>
                <td :style="{ color: shareItem?.total_profit > 0 ? $store.getters.upColor[3] : (!Number(shareItem?.total_profit) ? '' : $store.getters.downColor[3]), width: (105 - $f.getTextWidth($t('profit'))) + 'px'}">
                  <template v-if="shareItem?.total_profit >0">
                    ${{ $f.formatNumberS(shareItem?.total_profit || 0, 2) }}
                  </template>
                  <template v-else-if="shareItem?.total_profit_ratio =='--'">--</template>
                  <template v-else>
                    -${{ $f.formatNumberS(Math.abs(shareItem?.total_profit) || 0, 2) }}
                  </template>
                </td>
              </tr>
              <tr>
                <td :style="{width: ($f.getTextWidth($t('profit')) + 20 + 'px')}">{{ $t('balance2') }}</td>
                <td>${{ $f.formatNumber2(shareItem?.balance_usd || 0) }}</td>
              </tr>
              <tr>
                <td :style="{width: ($f.getTextWidth($t('lastPrice1')) + 20 + 'px')}">{{ $t('costPrice') }}</td>
                <td v-if="shareItem?.average_purchase_price_usd=='--'">--</td>
                <td v-else>${{ $f.formatNumber2(shareItem?.average_purchase_price_usd || 0) }}</td>
              </tr>
              <tr>
                <td :style="{width: ($f.getTextWidth($t('lastPrice1')) + 20 + 'px')}">{{ $t('lastPrice1') }}</td>
                <td>${{ $f.formatNumber2(shareItem?.current_price_usd || 0) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="invite">
            <div class="tr mt_10">
              <span class="font-20 font_weight_700 block">{{ $t('campaignSubTitle') }}</span>
              <span class="font-12 font_weight_400 mt_10">{{ $t('campaignDesc') }}</span>
            </div>
            <div class="ml_10">
              <img :src="qrcodeUrl" :alt="$t('campaignScan')" width="60px" height="60px">
              <span class="font-14 font_weight_400 mt_5 block">{{ $t('campaignScan') }}</span>
            </div>
          </div>
        </div>

        <!-- <el-button style="width: 630px; margin-top: 20px" native-type="button" color="#333333" icon="DocumentCopy" size="large" @click.stop="copyImage" :loading="loadingCopy">{{ $t('copyImage') }}</el-button> -->
        <div class="flex mt-20 text-12px" style="width: 300px; color: #999;">
          <div class="flex-col flex-center clickable" @click.stop="downloadSharePoster">
            <img src="@/assets/images/share/download.svg" height="48" alt="" srcset="">
            <span class="mt-8">{{ $t('download') }}</span>
          </div>
          <!-- <div class="flex-col flex-center clickable" @click.stop="copyImage">
            <img src="@/assets/images/share/copy.svg" height="48" alt="" srcset="">
            <span class="mt-8">{{ $t('copy') }}</span>
          </div> -->
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpX()">
            <img src="@/assets/images/share/twitter.svg" height="48" alt="" srcset="">
            <span class="mt-8">Twitter</span>
          </div>
          <div class="flex-col flex-center clickable" @click.stop="$f.jumpTg()">
            <img src="@/assets/images/share/tg.svg" height="48" alt="" srcset="">
            <span class="mt-8">Telegram</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import netSelect from '@/components/bot/netSelect'
import html2canvas from 'html2canvas'
import { useMinTableDataFetching } from '@/utils/hook.js'
import up1 from '@/assets/images/pc_share/up_1.webp'
import down1 from '@/assets/images/pc_share/down_1.webp'
import QRCode from 'qrcode'
// import { throttle } from 'lodash'
// 获取1-5的随机值
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 'down_1.png,down_2.png,down_3.png,down_4.png,down_5.png|up_1.png,up_2.png,up_3.png,up_4.png,up_5.png'

export default {
  props: {
    tokenList: {
      type: Array,
      default: () => []
    },
    pDialogVisible: {
      type: Boolean,
      default: false
    },
    isShowTop: {
      type: Boolean,
      default: true
    },
  },
  components:{netSelect},
  emits: ['changeToken'],
  data() {
    return {
      DialogVisible: false,
      dialogVisible:false,
      shareItem: this.tokenList?.[0] || {},
      logoTokenBase64: '',
      logoChainBase64: '',
      shareImgCanvas: '',
      loadingCopy: false,
      bgImg: '',
      qrcodeUrl: '',
      holderList: [],
      loading:false,
      balancePage: {
        pageNO: 1,
        pageSize: 10,
        loaded: false,
        finished: false
      },
      tableFilter: {}
    }
  },
  created() {
  },
  activated() {
    // this.init()
  },
  mounted() {

  },
  watch:{
    currentAccount(val){
      if(val) this.tableFilter = useMinTableDataFetching('tableFilter2-'+val).value
    },
    'tableFilter.hide_risk': 'resetGetBalanceList',
    'tableFilter.hide_small': 'resetGetBalanceList',
    'tableFilter.sort': 'resetGetBalanceList',
    'tableFilter.sort_dir': 'resetGetBalanceList',
    'tableFilter.user_ids'(newVal, oldVal){
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        // console.log('tableFilter.user_ids2 changed', newVal, oldVal);
        this.resetGetBalanceList()
      }
    },
    pDialogVisible: {
      handler(val) {
        if (val) {
          this.init()
          // console.log('Position Table pDialogVisible', this.currentAccount)
        }
        else {
          this.balancePage.pageNO = 1
          this.balancePage.loaded = false
          // this.holderList = []
        }
      },
      immediate: false
    },
    '$store.state.chainId'(val) {
      // console.log('$store.state.chainId', val)
      if (!val) {
        this.balancePage.pageNO = 1
        this.balancePage.loaded = false
        this.holderList = []
      } else {
        // this.holderList = []
        this.resetGetBalanceList()
      }
    },
  },
  computed: {
    userAddresse1() {
      return this.$store.state.bot?.userInfo?.addresses?.[0]?.address || ''
    },
    currentAccount() {
      return this.$store.state.currentAccount || this.$store.state.bot?.userInfo?.evmAddress || ''
    },
    token() {
      let address = this.$f.getAddressAndChainFromId(this.$route.params?.id || this.$store.state?.id)?.address || this.$store.state.tokenInfo?.address
      return address
    },
    upImg() {
      let globalConfig = this.$store.state.globalConfig
      let shareImg = globalConfig?.pc_share_image?.replace(/^.*\|/, '')
      return shareImg.split(',').map(img => {
        return globalConfig?.token_logo_url + 'pc_share/' + img
      })
    },
    downImg() {
      let globalConfig = this.$store.state.globalConfig
      let shareImg = globalConfig?.pc_share_image?.replace(/\|.*$/, '')
      return shareImg?.split(',')?.map?.(img => {
        return globalConfig?.token_logo_url + 'pc_share/' + img
      })
    },
    allImg() {
      let globalConfig = this.$store.state.globalConfig
      let shareImg = globalConfig?.pc_share_image?.replace('|', ',')
      let shareImgs = shareImg.split(',')
      return shareImgs?.map?.(img => {
        if (img) {
          return globalConfig?.token_logo_url + 'pc_share/' + img
        }
        return img
      })
    }
  },
  methods: {
    init() {
      if (this.currentAccount||this.userAddresse1) {
        this.tableFilter = useMinTableDataFetching('tableFilter2-'+this.currentAccount).value
        this.resetGetBalanceList();
      }
    },
    netSelectConfirm(val){
      this.tableFilter.user_ids=val
    },
    resetGetBalanceList() {
      this.balancePage.pageNO = 1
      this.balancePage.loaded = false
      this.getUserBalanceList()
    },
    getUserBalanceList() {
      // "address": "0x678aa0c243639f81ab6e2b72baa6ed697cb89f6b",
      // "token": "0x5cdf0869e7f69f48c3ebf49e78d16f5f2b165e3e",
      // "chain": "base",
      // "symbol": "Minidoge",
      // "logo_url": "",
      // "balance": 1.157920892373162e+59,  // 余额 token数量
      // "balance_usd": 6.038884151750488e+49,// 余额 usd 的数据
      // "total_profit": "",   //PNL ,只有solana链才可能会有数据
      // "total_profit_ratio": "", // PNL Rate ,只有solana链才可能会有数据
      // "current_price_usd": 5.215282141920576e-10, //当前价格
      // "price_change": -100, // 价格变化
      // "risk_level": -1,
      // "risk_score": 100
      console.log('this.holderList', this.holderList,this.tableFilter)
      if (this.balancePage.loaded) return
      this.balancePage.loaded = true
      let pageNO = this.balancePage.pageNO
      let pageSize = this.balancePage.pageSize
      const tableFilter={...this.tableFilter}
      if(tableFilter.user_ids&&!tableFilter.user_ids.length){
        delete tableFilter.user_ids
      }
      return this.$store.dispatch('getUserBalance', { ...tableFilter,...this.balancePage,isTop:true }).then(res => {
        if (Array.isArray(res) && res?.length > 0) {
          if (pageNO === 1) {
            this.holderList = res?.map(i => ({ ...i, index: `${i.token}-${i.chain}` }))
          } else {
            let list = res?.filter?.(i => this.holderList?.every?.(j => j.index !== `${i.token}-${i.chain}`))?.map(i => ({ ...i, index: `${i.token}-${i.chain}` }))
            this.holderList = this.holderList.concat(...list)
          }

          this.balancePage.finished = res?.length < pageSize
          if (!this.balancePage.finished) {
            this.balancePage.pageNO++
          }
          let a = this.holderList?.map(i => i.index)
          this.$store.commit('setWsState', { name: 'multiPriceParams', value: { ...this.$store.state.ws.multiPriceParams, ...{ 'hot': [], 'gainer': [], 'favorite': [], holder: a } } })
        } else {
          if (this.balancePage.pageNO == 1) {
            this.holderList = []
          }
        }
        console.log('holderList', this.holderList)
      }).finally(() => {
        setTimeout(() => {
          this.balancePage.loaded = false
          this.loading=false;
        }, 200)
      })
    },
    openDialog(item) {
      this.dialogVisible = true
      this.shareItem = item
      this.getQRCode()
      this.getRandomBg(item?.total_profit_ratio > 0)
      setTimeout(() => {
        this.getShareImg()
      }, 100)
    },
    downloadFile(blob, filename) {
      let url = ''
      if (typeof blob === 'string') {
        url = blob
      } else {
        url = URL.createObjectURL(blob)
      }
      let a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click();
      window.URL.revokeObjectURL(url)
    },
    downloadSharePoster() {
      let postersDom = document.querySelector('.share-card')
      if (postersDom ) {
        html2canvas(postersDom, {
          backgroundColor: null,
          scale: 3,
          allowTaint: true,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
        }).then(canvas => {
          let dataURL = canvas.toDataURL('image/png')
          this.downloadFile(dataURL, `ave-${this.shareItem?.symbol}-${Date.now()}.png`)
        })
      }
    },
    getShareImg() {
      let postersDom = document.querySelector('.share-card')
      if (postersDom ) {
        return html2canvas(postersDom, {
          backgroundColor: null,
          scale: 3,
          allowTaint: true,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          height: postersDom.clientHeight - 1
        }).then(canvas => {
          this.shareImgCanvas = canvas
          return canvas
        })
      }
    },
    copyImage() {
      if (this.shareImgCanvas) {
        this.loadingCopy = true
        this.shareImgCanvas.toBlob(async (blob) => {
          const item = new window.ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            this.$message.success(this.$t('copySuccess'))
          }).catch(() => {
            // this.$message.error(this.$t('copyFail'))
          }).finally(() => {
            this.loadingCopy = false
          })
        }, 'image/png')
      } else {
        this.loadingCopy = true
        this.getShareImg().then((canvas) => {
          try {
            canvas.toBlob(async (blob) => {
              const item = new window.ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]).then(() => {
                this.$message.success(this.$t('copySuccess'))
              }).catch(() => {
                // this.$message.error(this.$t('copyFail'))
              }).finally(() => {
                this.loadingCopy = false
              })
            }, 'image/png')
          } catch (error) {
            console.log(error)
            this.loadingCopy = false
          }
        })
      }
    },
    // 随机获取背景图片
    getRandomBg(isUp = false) {
      let imgs = isUp ? this.upImg : this.downImg
      let len = imgs.length
      let index = getRandom(1, len)
      this.bgImg = imgs?.[index] || (isUp ? up1 : down1)
    },
    getQRCode() {
      let inviterUrl = this.$store.state.globalConfig.inviter_url_v2 || 'https://share.ave.ai'
      let refCode = this.$store.state.bot.referralInfo.refCode || ''
      let refCodeParams = refCode? '&code=' + refCode : ''
      let shareLink = inviterUrl + '?lang=' + this.$store.getters.language + refCodeParams
      QRCode.toDataURL(shareLink, { margin: 1 })
        .then(url => {
          this.qrcodeUrl= url
        })
        .catch(err => {
          console.error(err)
        })
    },
  },
}
</script>
<style lang="scss">
  .table-position.el-table {
    --el-table-tr-bg-color: var(--custom-bg-1-color);
    // --el-bg-color: var(--custom-primary-lighter-0-color);
    --el-table-bg-color: var(--custom-bg-1-color);
    // --el-table-row-hover-bg-color: var(--custom-td-hover-2-color);
    --el-table-text-color: var(--a-text-1-color);
    --el-table-header-bg-color: var(--custom-table-th-bg-color);
    // --el-fill-color-lighter: var(--custom-table-stripe-bg-color);
    --el-fill-color-lighter: var(--custom-bg-1-color);
    --el-table-header-text-color: var(--a-text-2-color);
    --el-table-border-color: var(--custom-br-1-color);
    --el-table-row-hover-bg-color: var(--a-table-hover-bg-color);
    background: var(--custom-bg-1-color);
    --el-bg-color: var(--custom-bg-1-color);
    --el-table-border: 0.5px solid var(--custom-br-1-color);
    font-size: 14px;
    th {
      padding: 6px 0;
      border-bottom: none !important;
      height: 32px;
      &.el-table__cell.is-leaf {
        border-bottom: none;
        &.descending {
          .cell {
            color: var(--custom-primary-color);
            .sort-caret {
              &.descending {
                border-top-color: var(--custom-primary-color);
              }
            }
          }
        }
        &.ascending {
          .cell {
            color: var(--custom-primary-color);
            .sort-caret {
              &.ascending {
                border-bottom-color: var(--custom-primary-color);
              }
            }
          }
        }
      }
      .cell {
        font-weight: 400;
        font-size: 12px;
      }
    }
    .table-empty {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px 0;
      // min-height: 200px;
    }
    .icon-token-container {
      .token-icon {
        width: 32px;
        height: 32px;
      }
      .icon-symbol {
        width: 12px;
        height: 12px;
        top: 21px;
        left: 21px;
      }
    }
  }
  .dialog-share.el-dialog {
    --el-dialog-padding-primary: 24px;
    --el-bg-color: #222222;
    padding: 24px;
    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      // padding-bottom: 25px;
      padding: 25px;
      padding-top: 10px;
      .share-card {
        position: relative;
        overflow: hidden;
        width: 630px;
        padding: 25px;
        padding-bottom: 25px;
        background: #333;
        z-index: 1;
        // border-radius: 8px;
        color: #fff;
        .icon-token-container {
          .token-icon {
            width: 40px;
            height: 40px;
          }
          .icon-symbol {
            max-width: 16px;
            width: 14px;
            height: 14px;
            top: 25px;
            left: 25px;
          }
        }
        .share-table {
          // width: 200px;
          border-collapse: collapse;
          font-size: 14px;
          tr {
            td {
              padding: 5px 0;
              &:nth-child(2n + 1){
                color: #999;
                text-align: left;
              }
            }
          }
        }
        .share-bg-img {
          position: absolute;
          // inset: 0;
          top: -1px;
          right: -1px;
          height: 101%;
          z-index: -1;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .ellipsis{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100px;
  }
  .tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px 0 0px;
    margin-top: 10px;
    width: 320px;
  }
</style>
