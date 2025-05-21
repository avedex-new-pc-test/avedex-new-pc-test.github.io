<template>
  <div>
    <el-dialog v-model="dialogVisible" modal-class="dialog-connect-bg" width="632" height='718'
      :class='["dialog-connect", mode, emailRegisterType]' append-to-body>
      <div class="w-logo">
        <img v-if="mode === 'dark'" src="@/assets/images/logo1-83.29x21.97.png" alt="logo" height="21.97">
        <img v-else src="@/assets/images/logo2-83.29x21.97.png" alt="logo" height="21.97">
        <span>{{ $t('campaignTitle') }}</span>
      </div>
      <!-- <reset v-if="emailRegisterType == 'reset'" @update:cType="(cType) => emailRegisterType = cType"></reset> -->
      <div v-if="emailRegisterType == 'reset'" />
      <template v-else>
        <div class='w-content'>
          <h3 class="connect-popup-title filterArray-button font-500">
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
                class="text-14px text-center"
                style="min-height: 200px; color: var(--a-text-1-color)"
              >
                <emailRegisterAndLogin ref="loginForm" :cType="emailRegisterType"
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
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@element-plus/icons-vue'
// import CryptoJS from 'crypto-js'
// import reset from './reset.vue'
// import connectChainWallet from './connectChainWallet'
import emailRegisterAndLogin from './emailRegisterAndLogin.vue'
const botStore = useBotStore()
const { isDark } = useThemeStore()
const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const mode = computed(() => isDark ? 'dark' : 'light')
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

/* .content {
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
} */

/* .filterArray-container {
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
} */

/* .icon-net-connect {
  font-size: 24px;
  border-radius: 50%;
  margin-right: 3px;

  &.mr-0 {
    margin-right: 3px;
  }
} */

/* .select2 {
  width: 100%;

  &:deep(.el-input__inner) {
    border-radius: 0px;

    &.select3 {
      padding-left: 40px !important;
    }
  }
} */

/* .el-select {
  width: 150px;
} */

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