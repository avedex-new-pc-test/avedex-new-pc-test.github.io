<template>
  <div class="flex">
    <el-popover
      v-model:visible="tgWalletVisible"
      placement="bottom-end"
      :width="360"
      trigger="click"
      :key="$route.name"
      :popper-style="`--el-popover-padding: 0; --el-bg-color-overlay: ${ $store.state.mode === 'dark' ? '#222222' : '#ffffff'}`"
    >
      <template #reference>
        <div class="flex text-12px clickable-btn tg-name-box">
          <img style="border-radius: 50%;margin-right: 5px;" height="16" :src="$f.generateAvatarIcon($store.state?.bot?.userInfo?.name || '')" alt="">
          <span>{{ $store.state?.bot?.userInfo?.name || '' }}</span>
          <i class="arrow-up iconfont icon-xiala" :class="{active: !!tgWalletVisible}"></i>
        </div>
      </template>
      <div class="tg-wallet-container">
        <div class="tg-wallet-list" v-show="showVisible === 0">
          <div class="flex-start text-16px tg-wallet-list_title" @click.stop="showVisible = 1">
            <div class="flex-start clickable">
              <img style="border-radius: 50%;margin-right: 5px;" height="40" :src="$f.generateAvatarIcon($store.state?.bot?.userInfo?.name || '')" alt="">
              <span style="margin-right: 8px;">{{ $store.state?.bot?.userInfo?.name || '' }}</span>
              <i class="arrow-up iconfont icon-xiala" style="font-size: 8px; zoom: 0.8;" ></i>
            </div>
          </div>
          <ul class="tg-wallet-list_content">
            <el-scrollbar :max-height="300">
              <li v-for="(item, index) in $store.state?.bot?.userInfo?.addresses || []" :key="index" class="clickable" @click.stop="$router.push({name: 'Balance', params: {chain: item.chain, userAddress: item.address}});tgWalletVisible=false">
                <img :src="`${$store.state.s3BaseUrl}chain/${item.chain}.png`" class="mr-5 round" height="32" alt="">
                <div>
                  <div class="text-16px">{{ $f.getChainInfo(item.chain)?.name }}</div>
                  <div class="text-12px color-text-2 mt-5">
                    <span>{{ item.address?.replace?.(new RegExp('(.{6})(.+)(.{4})'), '$1...$3') }}</span>
                    <i
                      class="iconfont icon-copy ml-5"
                      style="font-size: 12px"
                      v-copy="item.address"
                      @click.stop
                    ></i>
                  </div>
                </div>
                <div class="text-right" style="margin-left: auto;">
                  <div class="text-14px">{{ $f.formatNumberS(item?.balance || 0, 5) }} {{ $f.getChainInfo(item.chain)?.main_name }}</div>
                  <div class="text-12px color-text-2 mt-5">$ {{ $f.formatNumberS((item?.price || 0) * Number(item?.balance || 0)) }}</div>
                </div>
              </li>
            </el-scrollbar>
          </ul>
          <div style="flex: 1;"></div>
          <div class="tg-wallet-list_footer">
            <div style="display: flex;">
              <el-button style="flex: 1;" size="large" color="#333333" @click.stop="showVisible = 2">{{ $t('deposit') }}</el-button>
              <el-button style="flex: 1; margin-left: 8px;" size="large" color="#333333" @click.stop="showVisible = 3">{{ $t('withdraw') }}</el-button>
            </div>
            <el-button style="width: 100%;margin-top: 8px; color: #959A9F;" size="large" color="#333333" @click.stop="$store.dispatch('bot_logout');tgWalletVisible=false">{{ $t('logout') }}</el-button>
          </div>
        </div>
        <div class="tg-wallet-list" v-show="showVisible === 1">
          <div class="flex-start text-16px tg-wallet-list_title">
            <el-icon size="24" class="clickable" @click.stop="showVisible = 0"><Back /></el-icon>
            <span class="ml-5">{{ $t('allAccounts') }}</span>
          </div>
          <ul class="tg-wallet-list_content">
            <el-scrollbar :max-height="300">
              <li v-for="(item, index) in $store.state.bot.walletList" :key="index" :class="{active: item.name === $store.state?.bot?.userInfo?.name}" @click.stop="$store.dispatch('bot_switchWallet', item);tgWalletVisible=false">
                <img style="border-radius: 50%;margin-right: 5px;" height="32" :src="$f.generateAvatarIcon(item?.name || '')" alt="">
                <span style="margin-right: auto;">{{ item.name || '' }}</span>
              </li>
            </el-scrollbar>
          </ul>
        </div>
        <div class="tg-wallet-list" v-show="showVisible === 2">
          <div class="flex-start text-20px tg-wallet-list_title">
            <el-icon size="24" class="clickable" @click.stop="showVisible = 0"><Back /></el-icon>
            <span class="ml-5">{{ $t('deposit') }}</span>
          </div>
          <div class="tg-wallet-list_content">
            <div style="padding: 15px 20px;">
              <el-select
                class="chains-select"
                v-model="depositChain"
                placeholder="Select"
                size="large"
                style="width: 100%"
                :teleported="false"
                suffix-icon="ArrowDownBold"
              >
                <template #prefix>
                  <img
                    v-if="depositChain"
                    height="24"
                    class="mr-5 round"
                    :src="`${$store.state.s3BaseUrl}chain/${depositChain}.png`"
                    style=""
                    alt=""
                    srcset=""
                  />
                </template>
                <el-option
                  v-for="item in $store.state?.bot?.userInfo?.addresses || []"
                  :key="item.chain"
                  :label="$f.getChainInfo(item.chain)?.name"
                  :value="item.chain"
                >
                  <div class="flex-start">
                    <img
                      v-if="item.chain"
                      height="24"
                      class="mr-5 round"
                      :src="`${$store.state.s3BaseUrl}chain/${item.chain}.png`"
                      style=""
                      alt=""
                      srcset=""
                    />
                    <span>{{ $f.getChainInfo(item.chain)?.name || '' }}</span>
                  </div>
                </el-option>
              </el-select>
              <div class="flex-center mt-30 flex-col" >
                <canvas id="qr-chain-canvas"></canvas>
                <div class="text-12px" style="display: flex; align-items: center; word-break: break-all; line-height: 1.2; padding: 20px 20px 40px; color: var(--a-text-4-color);">
                  <span>{{ depositChainInfo?.address || '' }}</span>
                  <i
                    v-if="depositChainInfo?.address"
                    class="iconfont icon-copy ml-5"
                    style="font-size: 16px; cursor: pointer;"
                    v-copy="depositChainInfo?.address"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tg-wallet-list" v-show="showVisible === 3">
          <div class="flex-start text-20px tg-wallet-list_title">
            <el-icon size="24" class="clickable" @click.stop="showVisible = 0"><Back /></el-icon>
            <span class="ml-5">{{ $t('withdraw') }}</span>
          </div>
          <el-form ref="withdrawForm" :model="withdrawForm" :rules="rules" hide-required-asterisk class="tg-wallet-list_content" size="large" @submit.prevent="handleWithdraw">
            <div style="padding: 15px 20px 40px;" >
              <el-form-item label="" label-position="top">
                <el-select
                  class="chains-select"
                  v-model="withdrawForm.chain"
                  placeholder="Select"
                  size="large"
                  style="width: 100%"
                  :teleported="false"
                  suffix-icon="ArrowDownBold"
                  @change="handleWithdrawChainChange"
                >
                  <template #prefix>
                    <img
                      v-if="withdrawForm.chain"
                      height="24"
                      class="mr-5 round"
                      :src="`${$store.state.s3BaseUrl}chain/${withdrawForm.chain}.png`"
                      style=""
                      alt=""
                      srcset=""
                    />
                  </template>
                  <el-option
                    v-for="item in $store.state?.bot?.userInfo?.addresses || []"
                    :key="item.chain"
                    :label="$f.getChainInfo(item.chain)?.name"
                    :value="item.chain"
                  >
                    <div class="flex-start">
                      <img
                        v-if="item.chain"
                        height="24"
                        class="mr-5 round"
                        :src="`${$store.state.s3BaseUrl}chain/${item.chain}.png`"
                        style=""
                        alt=""
                        srcset=""
                      />
                      <span>{{ $f.getChainInfo(item.chain)?.name || '' }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('plsEnterAmount')" label-position="top" prop="amount">
                <el-input style="background: var(--custom-bg-9-color); --el-input-bg-color: var(--custom-bg-9-color); --el-input-border-color: var(--custom-bg-9-color); border-radius: 4px;--el-input-height:48px;" v-model="withdrawForm.amount" inputmode="decimal" @input="value => withdrawForm.amount = value.replace(/\-|[^\d.]/g, '')" clearable placeholder="0.00">
                  <template #suffix>
                    <span class="color-text-1">{{ $f.getChainInfo(withdrawForm.chain)?.main_name }}</span>
                  </template>
                </el-input>
                <div class="text-12px color-text-2 text-right" style="width: 100%; line-height: 1; margin-top: 5px;position: absolute; right: 0; top: 100%;">
                  <span class="clickable" @click.stop="handleMax">{{ $t('balance1') }}: {{ $f.formatNumberS(withdrawChainInfo?.balance || 0, 5) }} {{ $f.getChainInfo(withdrawForm.chain)?.main_name }}</span>
                </div>
              </el-form-item>
              <el-form-item :label="$t('plsEnterAddress')" label-position="top" prop="address">
                <el-input style="background: var(--custom-bg-9-color); --el-input-bg-color: var(--custom-bg-9-color); --el-input-border-color: var(--custom-bg-9-color); border-radius: 4px;--el-input-height:48px;" v-model="withdrawForm.address" clearable placeholder="">
                </el-input>
              </el-form-item>
              <el-form-item v-if="withdrawForm.chain === 'ton'" label="memo" label-position="top" prop="memo">
                <el-input style="background: var(--custom-bg-9-color); --el-input-bg-color: var(--custom-bg-9-color); --el-input-border-color: var(--custom-bg-9-color); border-radius: 4px;--el-input-height:48px;" v-model="withdrawForm.memo" clearable placeholder="">
                </el-input>
              </el-form-item>
              <el-button native-type="submit" style="width: 100%; margin-top: 5px" size="large" :color="$store.state.mode === 'dark' ? '#f5f5f5' : '#333333'" :loading="loadingWithdraw">{{ $t('withdraw') }}</el-button>
            </div>
          </el-form>

        </div>
        <double-check v-if="showVisible === 4" @action="handleWithdraw2" v-model:showVisible="showVisible" @update:emailCode="(code)=>emailCode=code" @update:authCode="(code)=>authCode=code" :visible="tgWalletVisible"></double-check>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import DoubleCheck from "./doubleCheck.vue"
import BigNumber from 'bignumber.js'
import QrCodeWithLogo from 'qr-code-with-logo'
import { bot_createSafeTransferTx, bot_getTransferGasFee } from '@/api'
import { NATIVE_TOKEN } from '@/utils/constants'
import { evm_utils as utils,isValidAddress } from '@/utils'
import { throttle } from 'lodash'

const store = useStore()
const route = useRoute()
const router = useRouter()

const tgWalletVisible = ref(false)
const showVisible = ref(0)
const depositChain = ref('solana')
const withdrawForm = ref({
  amount: '',
  address: '',
  chain: 'solana',
  memo: ''
})
const loadingWithdraw = ref(false)
const emailCode = ref('')
const authCode = ref('')
const withdrawFormRef = ref(null)

const gasFeeObj = ref({
  solana: 1000000,
  eth: 599999906814000,
  bsc: 21000000000000,
  base: 452549454000
})

const depositChainInfo = computed(() => {
  return store.state?.bot?.userInfo?.addresses?.find?.(i => i?.chain === depositChain.value)
})

const withdrawChainInfo = computed(() => {
  return store.state?.bot?.userInfo?.addresses?.find?.(i => i?.chain === withdrawForm.value.chain)
})

const checkAddress = (chain) => (rule, value, callback) => {
  if (!value) {
    return callback(new Error(store.getters.$t('plsEnterAddress')))
  } else if (!isValidAddress(value, chain)) {
    return callback(new Error(store.getters.$t('pleaseEnterCorrectAddress')))
  } else {
    callback()
  }
}

const checkAmount = (balance) => (rule, value, callback) => {
  if (!value) {
    return callback(new Error(store.getters.$t('plsEnterAmount')))
  } else if (new BigNumber(value).gt(balance)) {
    return callback(new Error(store.getters.$t('insufficientBalance2')))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  amount: [
    { required: true, message: store.getters.$t('plsEnterAmount'), trigger: 'blur' },
    { validator: checkAmount(withdrawChainInfo.value?.balance || 0), trigger: 'blur' }
  ],
  address: [
    { required: true, message: store.getters.$t('plsEnterAddress'), trigger: 'blur' },
    { validator: checkAddress(withdrawForm.value?.chain), trigger: 'blur' }
  ]
}))

watch(tgWalletVisible, () => {
  showVisible.value = 0
  emailCode.value = ""
  authCode.value = ""
})

watch(() => depositChainInfo.value?.chain, () => {
  if (depositChainInfo.value?.address) {
    setChainQr()
  }
})

watch(showVisible, (val) => {
  if (val === 2) {
    setChainQr()
  } else if (val === 3) {
    withdrawFormRef.value?.resetFields?.()
  }
})

// watch(() => store.state.bot.topUp.key, (val) => {
//   if (route.name === 'Token') {
//     tgWalletVisible.value = true
//     depositChain.value = store.state.bot.topUp.chain
//     setTimeout(() => {
//       showVisible.value = 2
//     }, 100)
//   }
// })

watch(() => withdrawForm.value.chain, (val) => {
  if (val) {
    withdrawFormRef.value?.resetFields?.()
    bot_getTransferGasFee()
  }
})

onMounted(() => {
  preLoadShareImg()
  bot_getTransferGasFee()
})

function handleWithdrawChainChange(val) {
  if (val && !withdrawForm.value.amount && !withdrawForm.value.address) {
    withdrawFormRef.value?.resetFields?.()
    nextTick(() => {
      withdrawFormRef.value?.resetFields?.()
    })
  }
}

async function setChainQr() {
  let address = store.state?.bot?.userInfo?.addresses?.find?.(i => i?.chain === depositChain.value)?.address
  if (!address) {
    return
  }
  let canvas = document.getElementById('qr-chain-canvas')
  QrCodeWithLogo.toCanvas({
    canvas: canvas,
    content: address,
    width: 200,
    nodeQrCodeOptions: {
      margin: 2,
    },
    logo: {
      src: `${store.state.s3BaseUrl}chain/${depositChain.value}.png`,
      radius: 8
    }
  }).catch(err => {
    console.log('QrCodeWithLogo error', err)
  })
}

function handleWithdraw() {
  withdrawFormRef.value.validate((valid) => {
    if (valid) {
      let decimals = withdrawChainInfo.value?.decimals || 18
      let gasFee = new BigNumber(gasFeeObj.value[withdrawForm.value.chain] || 0).div(10 ** decimals).plus(withdrawForm.value.amount || 0)
      if (withdrawForm.value?.chain === 'solana') {
        gasFee = gasFee.plus('0.002')
      }

      let balance = new BigNumber(withdrawChainInfo.value?.balance || 0)
      if (balance.lt(gasFee)) {
        store._vm.$message.error(store.getters.$t('transferInsufficientBalance', {s: store.getters.$f.getChainInfo(withdrawForm.value.chain)?.main_name}))
        return
      }
      showVisible.value = 4
    } else {
      return false
    }
  })
}

function handleWithdraw2() {
  withdrawFormRef.value.validate((valid) => {
    if (valid) {
      let chainMainToken = {
        solana: 'sol',
        ton: 'TON',
      }
      let amount = (new BigNumber(withdrawForm.value.amount || 0)).toFixed().match(new RegExp(`[0-9]*(\\.[0-9]{0,${withdrawChainInfo.value?.decimals || 18}})?`))[0]
      if ((Number(amount) || 0) <= 0) {
        store._vm.$notify({title: 'Error', type: 'error', message: store.getters.$t('withdrawAmountTooSmall')})
        return
      }
      if (withdrawChainInfo.value?.address?.toLowerCase?.() === withdrawForm.value?.address?.toLowerCase?.()) {
        store._vm.$notify({title: 'Error', type: 'error', message: store.getters.$t('withdrawToSelf')})
        return
      }

      let data = {
        batchId: Date.now().toString(),
        chain: withdrawForm.value.chain,
        creatorAddress: withdrawChainInfo.value?.address,
        tokenAddress: chainMainToken[withdrawForm.value.chain] || NATIVE_TOKEN,
        tgUid: store.state.bot?.userInfo?.tgUid,
        amount: utils.parseUnits(amount || 0, withdrawChainInfo.value?.decimals || 18).toString(),
        transferTo: withdrawForm.value.address,
        memo: '',
        emailCode: emailCode.value,
        authCode: authCode.value
      }

      store._vm.$messageBox.confirm(store.getters.$t('confirmWithdraw', { 
        amount: amount, 
        address: withdrawForm.value.address, 
        symbol: store.getters.$f.getChainInfo(withdrawForm.value.chain)?.main_name 
      }), store.getters.$t('tips'), {
        confirmButtonText: store.getters.$t('confirm'),
        cancelButtonText: store.getters.$t('cancel'),
        appendTo: document.querySelector('.tg-wallet-container'),
      }).then(() => {
        loadingWithdraw.value = true
        bot_createSafeTransferTx(data).then(res => {
          if (res) {
            let Timer = setTimeout(() => {
              store._vm.$notify({title: 'Success', type: 'success', message: store.getters.$t('withdrawSubmitted') })
            }, 500)
            tgWalletVisible.value = false
            loadingWithdraw.value = false
            let unwatch = watch(() => store.state.bot.subscribeResult, (subscribeResult) => {
              let batchId = subscribeResult.batchId
              if (batchId === data.batchId) {
                if (Timer) {
                  clearTimeout(Timer)
                  Timer = null
                }
                if (subscribeResult?.success) {
                  store._vm.$notify({title: 'Success', type: 'success', message: store.getters.$t('withdrawSuccess') })
                  unwatch()
                  setTimeout(() => {
                    store.dispatch('bot_getUserAllChainBalance', withdrawForm.value.chain)
                  }, 1000)
                } else {
                  store._vm.$notify({title: 'Error', type: 'error', message: store.getters.$f.formatBotError(subscribeResult.failMessage) || 'Withdraw failed'})
                  unwatch()
                }
              }
            })
          }
        }).catch(err => {
          emailCode.value = ""
          authCode.value = ""
          store.getters.$f.handleBotError(err || 'Withdraw failed')
          loadingWithdraw.value = false
        })
      })
    }
  })
}

function preLoadShareImg() {
  let globalConfig = store.state.globalConfig
  let shareImg = globalConfig?.pc_share_image?.replace('|', ',')
  let shareImgs = shareImg?.split?.(',') || []
  shareImgs.forEach(img => {
    if (img) {
      let imgUrl = globalConfig?.token_logo_url + 'pc_share/' + img
      new Image().src = imgUrl
    }
  })
}

const bot_getTransferGasFee = throttle(function () {
  let chain = withdrawForm.value.chain
  return bot_getTransferGasFee({chain}).then(res => {
    gasFeeObj.value[chain] = res
    return res
  })
}, 500, {leading: true, trailing: true})

function handleMax() {
  let decimals = withdrawChainInfo.value?.decimals || 18
  if (!gasFeeObj.value[withdrawForm.value.chain] || 0) {
    bot_getTransferGasFee().catch(console.log)
  }
  let gasFee = new BigNumber(gasFeeObj.value[withdrawForm.value.chain] || 0).div(10 ** decimals)
  if (withdrawForm.value?.chain === 'solana') {
    gasFee = gasFee.plus('0.002')
  }
  let balance = new BigNumber(withdrawChainInfo.value?.balance || 0)
  if (balance.lt(gasFee)) {
    store._vm.$message.error(store.getters.$t('transferInsufficientBalance', {s: store.getters.$f.getChainInfo(withdrawForm.value.chain)?.main_name}))
    return
  }
  let amount = balance.minus(gasFee).toFixed().match(new RegExp(`[0-9]*(\\.[0-9]{0,${withdrawChainInfo.value?.decimals || 18}})?`))[0]
  withdrawForm.value.amount = amount
  withdrawFormRef.value?.validateField?.('amount')
}
</script>

<style lang="scss" scoped>
.tg-name-box {
  color: var(--custom-text-1-color);
  height: 32px;
  cursor: pointer;
  background: var(--custom-bg-6-color);
  border-radius: 4px;
  padding: 0 10px;
  min-width: 80px;
  .arrow-up {
    font-size: 8px;
    margin-left: 5px;
    transition: all 0.4s;
    zoom: 0.8;
    &.active {
      transform: rotateZ(180deg);
      transform-origin: center;
    }
  }
}

.tg-wallet-list {
  min-height: 400px;
  color: var(--custom-text-1-color);
  display: flex;
  flex-direction: column;
  .tg-wallet-list_title {
    padding: 20px;
    border-bottom: 0.5px solid var(--custom-br-1-color);
  }
  .tg-wallet-list_content {
    li {
      padding: 15px 20px;
      display: flex;
      align-items: center;
      line-height: 1;
      cursor: pointer;
      &:hover {
        background: var(--a-bg-7-color);
      }
      &.active {
        background: var(--a-bg-7-color);
      }
    }
  }
  .tg-wallet-list_footer {
    padding: 20px;
  }
  .chains-select {
    --el-select-border-color-hover: transparent;
    :deep() {
      .el-select__wrapper.el-select__wrapper {
        box-shadow: none;
        background: var(--a-bg-7-color);
        min-height: 48px;
      }
      .el-select-dropdown__item {
        padding: 0 32px 0 15px;
        height: 48px;
        --el-fill-color-lighter: var(--a-bg-7-color);
      }
    }
  }
  .go-wallet-route {
    margin-left: auto;
    font-size: 14px;
    color: #999999;
    &:hover {
      color: var(--a-text-6-color);
    }
  }
}
</style>