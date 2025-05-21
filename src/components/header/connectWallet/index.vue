<template>
  <div>
    <el-dialog
v-model="dialogVisible" modal-class="dialog-connect-bg" width="632" height='718'
      :class='["dialog-connect", mode, emailRegisterType]' append-to-body>
      <div class="w-logo">
        <img v-if="mode === 'dark'" src="@/assets/images/logo1-83.29x21.97.png" alt="logo" height="21.97">
        <img v-else src="@/assets/images/logo2-83.29x21.97.png" alt="logo" height="21.97">
        <span>{{ $t('campaignTitle') }}</span>
      </div>
      <!-- <reset v-if="emailRegisterType == 'reset'" @update:cType="(cType) => emailRegisterType = cType"></reset> -->
      <div v-if="emailRegisterType == 'reset'"/>
      <template v-else>
        <div class='w-content'>
          <h3 class="connect-popup-title filterArray-button font-500">
            <el-icon
v-if="botStore.connectWalletTab != '0'" :size="35" style="color:var(--d-999-l-222);"
              @click="botStore.connectWalletTab = '0'">
              <ArrowLeft />
            </el-icon>
            {{ title }}
          </h3>
          <div class="m-content">
            <div>
              <div
v-show="botStore.connectWalletTab == '0'" class="text-14px text-center"
                style="min-height: 200px; color: var(--a-text-1-color)">
                <emailRegisterAndLogin
ref="loginForm" :cType="emailRegisterType"
                  @update:c-type="(cType) => emailRegisterType = cType">
                  <template #nav>
                    <ul class="tabs">
                      <li
v-for="(item, index) in tabs" :key="index" class="filterArray"
                        :class="{ active: item.value == botStore.connectWalletTab }"
                        @click="botStore.connectWalletTab = item.value">
                        <span>{{ item.name }}</span>
                      </li>
                    </ul>
                  </template>
                </emailRegisterAndLogin>
              </div>
              <!-- <connectChainWallet v-if="botStore.connectWalletTab === '1'" @close="dialogVisible = false"
                :dialogVisible="dialogVisible" /> -->
              <!-- <el-form v-show="botStore.connectWalletTab === '2'" :model="form" ref="form" :rules="rules"
                label-width="0" size="large" label-position="top" @submit.prevent="importAddress" class="w-address">
                <el-form-item :label="$t('selectNetwork')">
                  <el-select style="width: 100%; --el-border-radius-base:8px;margin-bottom: 8px;" :key="form.chainId"
                    v-model="form.chainId" :placeholder="$t('selectNetwork')" size="large"
                    :filter-method="filterOptions" filterable popper-class="w-selectNet-popup">
                    <template #prefix>
                      <img v-if="chainInfo?.netName" class="icon-svg icon-net-connect mr-0"
                        :src="`${configStore?.token_logo_url}chain/${chainInfo?.netName}.png`" style="" alt="" srcset="" />
                    </template>
                    <el-option v-for="item in filteredNetworkList" :key="item?.chainId" :label="item?.name"
                      :value="item?.chainId" style="width: 100%;margin:10px 0">
                      <div style="display: flex; align-items: center; min-width: 200px">
                        <img class="icon-svg icon-net-connect"
                          :src="`${configStore?.token_logo_url}chain/${item?.netName}.png`" alt="" srcset="" />
                        <span>{{ item.name }}</span>
                        <span style="flex: 1"></span>
                        <span style="color: var(--el-text-color-secondary); font-size: 12px">
                          {{ item.description }}
                        </span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="address" :label="$t('address')">
                  <el-input v-model="form.address" :placeholder="$t('enterAddress')" clearable
                    style="--el-border-radius-base:8px;"></el-input>
                </el-form-item>
                <el-form-item prop="" class="text-center">
                  <div class="" style="width: 100%; text-align: center; margin-top: 30px; margin-bottom: 25px">
                    <el-button :color="mode == 'dark' ? '#F5F5F5' : '#222222'"
                      style="width: 100%; border-radius: 8px; height: 48px;" native-type="submit" size="large">
                      {{ $t('confirm') }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
              <el-form v-show="botStore.connectWalletTab === '3'" :model="form2" ref="form2" :rules="rules"
                label-width="auto" size="large" label-position="top" @submit.prevent="importCode" class='w-app'>
                <el-form-item prop="code" label="Code">
                  <el-input :rows="5" type="textarea" v-model="form2.code" :placeholder="$t('plsImport')"
                    clearable></el-input>
                </el-form-item>
                <el-form-item prop="" class="text-center">
                  <div class="" style="width: 100%; text-align: center; margin-top: 30px; margin-bottom: 25px">
                    <div class="font-12 tc width_100 mb_15" style="color: #f3841e">{{ $t('importTip') }}</div>
                    <el-button style="width: 100%; border-radius: 8px; height: 48px;" size="large"
                      :color="mode == 'dark' ? '#F5F5F5' : '#222222'" native-type="submit">
                      {{ $t('confirm') }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-form> -->
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@element-plus/icons-vue'
import CryptoJS from 'crypto-js'
// import reset from './reset.vue'
// import connectChainWallet from './connectChainWallet'
import emailRegisterAndLogin from './emailRegisterAndLogin.vue'
const botStore = useBotStore()
const configStore = useConfigStore()
const { isDark } = useThemeStore()
const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const mode=computed(() => isDark?'dark':'light')
// Refs
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// const dialogVisible =ref(true)
const form = ref({
  address: '',
  chainId: 56
})

const form2 = ref({
  code: ''
})

const emailRegisterType = ref('login')
const queryNetKey = ref('')
const loginForm = ref(null)
const formRef = ref(null)
const form2Ref = ref(null)

// Computed
const networkList = computed(() => useConfigStore().chainConfig)

const chainInfo = computed(() => networkList.value.find((i) => i.chain_id == form.value.chainId))

const addressPattern = computed(() => {
  console.log('chainInfo.value?.chain_id', chainInfo.value?.chain_id)
  if (isNaN(Number(chainInfo.value?.chain_id))) {
    const p = {
      tron: /^(T|t)[0-9a-zA-Z]{33}$/,
      solana: /^[0-9a-zA-Z]{43,44}$/,
      sui: /^[0-9a-zA-Z]{66}$/,
      brc20: /^[0-9a-zA-Z]{62}$/,
      runes: /^[0-9a-zA-Z]{62}$/
    }
    if (p[chainInfo.value?.chain_id]) {
      return p[chainInfo.value?.chain_id]
    }
    return /^[0-9a-zA-Z]{20,50}$/
  }
  return /^0x[0-9a-zA-Z]{40}$/
})

const rules = computed(() => ({
  address: [{ validator: validateAddress(addressPattern.value), trigger: 'blur' }],
  code: [{ required: true, message: t('cannotBeEmpty'), trigger: 'blur' }]
}))

const tabs = computed(() => [
  { name: t('chainWallet'), value: '1' },
  { name: t('importAddress'), value: '2' },
  { name: t('appCode'), value: '3' }
])

const title = computed(() => {
  const { connectWalletTab } = botStore
  if (connectWalletTab == '0') {
    if (emailRegisterType.value == 'login') {
      return t('loginBot')
    } else if (emailRegisterType.value == 'register') {
      return t('registerBot')
    } else {
      return t('tgBotWallet')
    }
  } else if (connectWalletTab == '1') {
    return t('connectChainWallet')
  } else if (connectWalletTab == '2') {
    return t('importAddress')
  } else if (connectWalletTab == '3') {
    return t('appCode')
  } else {
    return t('connectWallet')
  }
})

const filteredNetworkList = computed(() => {
  const reg = new RegExp(queryNetKey.value, 'i')
  return networkList.value.filter((i) => {
    return (i.vm_type === 'evm' || i.vm_type === 'tron' || i.vm_type === 'solana') &&
      (reg.test(i.name) || reg.test(i.vm_type) || reg.test(i.chain_id))
  })
})

// Methods
const validateAddress = (pattern) => (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('cannotBeEmpty')))
  } else if (!pattern.test(value)) {
    callback(new Error(t('pleaseEnterCorrectAddress')))
  } else {
    callback()
  }
}

const filterOptions = (value) => {
  queryNetKey.value = value
}

const importAddress = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      botStore.setWallet('importAddress')
      botStore.setChainId( chainInfo.value.chain_id)
      botStore.setCurrentAccount( form.value.address)
      // botStore
      dialogVisible.value = false
    }
  })
}

const importCode = () => {
  form2Ref.value.validate((valid) => {
    if (valid) {
      const key = 'f?t}6~fdMmQ6AyN^'
      const msg = CryptoJS.AES.decrypt(form2.value.code?.trim(), CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(key),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      const msgString = msg.toString(CryptoJS.enc.Utf8)
      if (form2.value.code && msgString?.split('-')?.length == 3) {
        const account = msgString.split('-')[0]
        const signature = msgString.split('-')[1]
        const chainId = msgString.split('-')[2]
        const signatureObj = botStore.signatureObj || {}
        signatureObj[account] = signature
        botStore.setChainId( chainId)
        botStore.setWallet('importAddress')
        botStore.setCurrentAccount( account)
        botStore.setSignatureObj( signatureObj)
        dialogVisible.value = false
      } else {
        // Handle error (you might want to use a notification system here)
        console.error(t('plsImportCorrect'))
      }
    }
  })
}

// Watchers
watch(dialogVisible, (val) => {
  if (!val && (emailRegisterType.value === 'reset' || emailRegisterType.value === 'register')) {
    emailRegisterType.value = 'login'
  }
  formRef.value?.resetFields?.()
  form2Ref.value?.resetFields?.()
})
</script>

<style lang="scss">
.dialog-connect.el-dialog {
  position: relative;
  border-radius: 15px;
  min-width: 632px;
  min-height: 696px;
  padding: 70px 86px 60px;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #222222;
  border: 1px solid #27282B;
  margin: 0;
  --el-dialog-padding-primary: 0px;

  .el-dialog__headerbtn {
    top: 11px;
    right: 11px;
  }

  &.reset {
    :deep() header {
      height: 0;
    }
  }

  &.light {
    background: var(--custom-primary-lighter-0-color) !important;
    border-color: #D8D8DC;
  }
}

.dialog-connect-bg {
  /* opacity: 0.8; */
}

.w-selectNet-popup.el-popper {
  max-width: 460px;
}
</style>

<style scoped lang="scss">
.w-logo {
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: row;
  left: 24px;
  top: 24px;

  >img {
    margin-right: 10.15px;
  }

  >span {
    display: flex;
    align-items: center;
    flex-direction: row;
    font-weight: 400;
    font-size: 12px;
    line-height: 100%;
    letter-spacing: 0%;
    color: #999999;

    &::before {
      content: '';
      display: inline-block;
      width: 0.97px;
      height: 4.85px;
      background-color: #999999;
      margin-right: 10.15px;
    }
  }
}

.content {
  border: 1px solid #444444;
  color: var(--custom-text-1-color);

  &:hover {
    border: 1px solid transparent;
    box-shadow: 0 0 0 1px #c0c4cc inset;
  }

  border-radius: 10px;

  &+.content {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  text-decoration: none;
  cursor: pointer;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .tip {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  h5 {
    margin: 0;
    padding: 0;
    font-weight: normal;
    font-size: 18px;
    font-weight: 500;
  }

  .icon-wallet {
    width: 33px;
    height: 35px;
  }

  .middle {
    font-size: 18px;
    text-align: left;
    margin-left: 20px;

    span {
      font-size: 14px;
      font-weight: 400;
      color: var(--custom-text-2-color);

      &.recommend {
        font-size: 12px;
        background: var(--custom-primary-lighter-10-color);
        color: #f6465d;
        padding: 1px 5px;
        border-radius: 4px;
      }

      &.red {
        color: red;
      }
    }
  }
}

.filterArray-container {
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: normal;
  color: #000;
  margin: 0px 0 15px 0px;

  .filterArray-radio-input {
    width: 0;
    height: 0;
    font-size: 0;
    opacity: 0;

    &:checked+.filterArray-item {
      font-size: 18px;
      color: var(--custom-text-1-color);
    }
  }

  .filterArray-button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-top: 10px;

    .filterArray-item {
      display: inline-block;
      border-radius: 20px;
      font-size: 16px;
      color: var(--custom-text-2-color);
      cursor: pointer;
    }

    .line {
      width: 0px;
      height: 16px;
      border-right: 1px solid #848e9c;
      margin-right: 15px;
      margin-left: 15px;
    }
  }
}

.icon-net-connect {
  font-size: 24px;
  border-radius: 50%;
  margin-right: 3px;

  &.mr-0 {
    margin-right: 3px;
  }
}

.select2 {
  width: 100%;

  &:deep(.el-input__inner) {
    border-radius: 0px;

    &.select3 {
      padding-left: 40px !important;
    }
  }
}

.el-select {
  width: 150px;
}

.w-content {
  display: inline-block;

  .m-content {
    width: 460px;
    margin: 0 auto;

    :deep() .el-input {
      --el-input-border-color: #444444;
      --el-input-placeholder-color: #999;
      --el-text-color-placeholder: #999;
    }

    :deep() .el-input.el-input--large {
      height: 48px;
    }

    :deep() .el-select--large .el-select__wrapper {
      height: 48px;
    }

    :deep() .el-form-item__label {
      color: var(--d-999-l-222);
    }

    .w-app {
      :deep() .el-textarea__inner {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }
    }

    .w-address {
      :deep() .el-select--large .el-select__wrapper {
        height: 48px;
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }
    }

    .tabs {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      width: fit-content;
      margin: 0 auto;
      margin-top: 40px;
      color: #F5F5F5;

      .filterArray {
        &>span {
          white-space: nowrap;
          cursor: pointer;
          text-decoration: underline;
        }

        &:not(:last-child)::after {
          content: '|';
          margin: 0 8px;
          text-decoration: none;
        }
      }
    }
  }

  .connect-popup-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: PingFang SC;
    font-size: 40px;
    font-weight: 600;
    line-height: 48px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #F5F5F5;
    margin-bottom: 30px;

    .el-icon {
      font-size: 16px;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }

  .connect-popup-title2 {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    text-decoration-skip-ink: none;
    color: #999999;
  }
}

.light {
  .w-content {
    .connect-popup-title {
      color: #222222;
    }

    .m-content .tabs {
      color: #222222;
    }

    .m-content :deep() .el-input {
      --el-input-border-color: #D8D8DC
    }

    .content {
      border: 1px solid #D8D8DC;
      color: var(--custom-text-1-color);

      &:hover {
        border: 1px solid transparent;
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }
    }
  }
}

:deep() .el-overlay {
  backdrop-filter: blur(1px);
}
</style>