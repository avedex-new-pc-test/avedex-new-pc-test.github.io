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
      <reset v-if="emailRegisterType == 'reset'" @update:c-type="(cType: string) => emailRegisterType = cType"/>
      <div v-if="emailRegisterType == 'reset'" />
      <template v-else>
        <div class='w-content'>
          <h3 class="connect-popup-title font-500">
            <el-icon
              v-if="botStore.connectWalletTab !== 0"
              :size="35"
              style="color:var(--d-999-l-222);"
              @click="botStore.connectWalletTab = 0">
              <ArrowLeft />
            </el-icon>
            {{ title }}
          </h3>
          <div class="m-content">
            <div>
              <div
                v-show="botStore.connectWalletTab == 0"
                class="text-14px text-center min-h-200px"
              >
                <emailRegisterAndLogin
                  ref="loginForm"
                  :cType="emailRegisterType"
                  @update:c-type="(cType) => emailRegisterType = cType">
                  <!-- <template #nav>
                    <ul class="tabs">
                      <li v-for="(item, index) in tabs" :key="index" class="filterArray"
                        :class="{ active: item.value == botStore.connectWalletTab }"
                        @click="botStore.connectWalletTab = item.value">
                        <span>{{ item.name }}</span>
                      </li>
                    </ul>
                  </template> -->
                </emailRegisterAndLogin>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
// import CryptoJS from 'crypto-js'
import reset from './reset.vue'
// import connectChainWallet from './connectChainWallet'
import emailRegisterAndLogin from './emailRegisterAndLogin.vue'
console.log('connectWallet')
const botStore = useBotStore()
const {mode} = storeToRefs(useGlobalStore())
const { t } = useGlobalStore()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
// Refs
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const emailRegisterType = ref('login')
const loginForm = ref(null)
const title = computed(() => {
  const { connectWalletTab } = botStore
  if (connectWalletTab == 0) {
    if (emailRegisterType.value == 'login') {
      return t('loginBot')
    } else if (emailRegisterType.value == 'register') {
      return t('registerBot')
    } else {
      return t('tgBotWallet')
    }
  } else if (connectWalletTab == 1) {
    return t('connectChainWallet')
  } else if (connectWalletTab == 2) {
    return t('importAddress')
  } else if (connectWalletTab == 3) {
    return t('appCode')
  } else {
    return t('connectWallet')
  }
})

// Watchers
watch(dialogVisible, (val) => {
  if (!val && (emailRegisterType.value === 'reset' || emailRegisterType.value === 'register')) {
    emailRegisterType.value = 'login'
  }
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

  &.light {
    background: var(--d-131722-l-FFF) !important;
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
:deep() .el-input {
  --el-input-border-color: #444444;
  --el-input-placeholder-color: var(--d-666-l-999);
  --el-text-color-placeholder: #999;
  --el-input-bg-color: var(--d-333-l-F2F2F2)
}
:deep()  .el-input__wrapper {
  border: none;
  border-radius: 6px;
  box-shadow: none;
  &:hover{
    box-shadow: 0 0 0 1px #3F80F7 inset;
  }
}
.w-content {
  display: inline-block;

  .m-content {
    width: 460px;
    margin: 0 auto;

 

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
  }
}

:deep() .el-overlay {
  backdrop-filter: blur(1px);
}
</style>
