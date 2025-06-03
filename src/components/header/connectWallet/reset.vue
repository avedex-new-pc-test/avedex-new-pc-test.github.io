<template>
  <div :class="['w-reset', mode]">
    <h3 v-if="step !== 3" class="title" :style="{ marginBottom: step === 2 ? '40px' : 0 }">{{ title }}
      <el-icon :size="35" style="color:var(--d-999-l-222);" @click="emit('update:c-type', 'login')">
        <ArrowLeft />
      </el-icon>
    </h3>
    <h3 v-if="step === 2" class="title2">{{ $t('startResetTitle2') }}({{ desensitizeEmail(form.email) }})</h3>
    <el-form
      ref="formRef" :model="form" :rules="rules" label-width="0" autocomplete="off" size="large"
      :style="{ marginTop: step === 1 ? '100px' : '10px' }" @submit.prevent>
      <el-form-item v-if="step === 1" label="" prop="email">
        <el-input
          v-model="form.email" :autocomplete="'new-email' + Math.random()" :placeholder="$t('startEmail')"
          name="emailField" />
      </el-form-item>
      <template v-else-if="step === 2">
        <el-form-item label="" prop="verificationCode">
          <el-input
            v-model="form.verificationCode" :autocomplete="'new-verificationCode' + Math.random()"
            :placeholder="$t('startVerificationCode')" name="new-verificationCode">
            <template #suffix>
              <el-button
                class="countdownBtn" link :disabled="disabledCountdownBtn" :loading="loading2" :style="{
                color: mode == 'dark' ? '#f5f5f5' : '#333333',
              }" @click="sendVerificationCode">
                {{
                  isCounting ? `${count}${$t("SS")}` : $t("startCountDown")
                }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input
            v-model="form.password" type="password" name="password_field"
            :autocomplete="'new-password' + Math.random()" :placeholder="$t('startPassword')" show-password />
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword" type="password" name="confirm_password_field"
            :placeholder="$t('startConfirmPassword')" :autocomplete="'new-password2' + Math.random()" show-password />
        </el-form-item>
      </template>
      <el-result v-else :title="$t('startSuccessTitle')">
        <template #icon>
          <img src="@/assets/images/success.svg" width="80px">
        </template>
      </el-result>
      <el-form-item>
        <el-button
          :color="'#3F80F7'" :class="['btn', (step === 3) && 'step3']"
          size="large" :loading="loading" style="width: 100%" @click="submitForm">{{ startSubmitText }}</el-button>
      </el-form-item>
      <p v-if="step === 2" class="tip">{{ $t('startResetTip') }}</p>
    </el-form>
  </div>
</template>

<script lang='ts' setup>
import sha256 from 'crypto-js/sha256'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  desensitizeEmail
} from '@/utils/index'

const emit = defineEmits(['update:c-type'])
const props = defineProps({
  cType: {
    type: String,
    required: true,
    validator: (value: string) => {
      return ['login', 'register', 'reset'].includes(value)
    },
  },
})
const userStore = useUserStore()
const { mode, lang } = storeToRefs(useGlobalStore())
const { t } = useI18n()

const count = ref(60) // 倒计时的初始值
const isCounting = ref(false) // 是否正在倒计时
const disabledCountdownBtn = ref(false)
const loading = ref(false)
const loading2 = ref(false)
const title = ref(t('startForgetPassword'))
const startSubmitText = ref(t('next'))
const step = ref(1)
const formRef = ref<FormInstance>()
const timer = ref<NodeJS.Timeout | null>(null)


type RuleForm = {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
};

const form = reactive<RuleForm>({
  email: userStore.email,
  verificationCode: '',
  password: '',
  confirmPassword: '',
})

const rules = computed<FormRules<RuleForm>>(() => {
  return {
    email: [
      { required: true, message: t('startEmailRequiredMsg'), trigger: 'blur' },
      { type: 'email', message: t('startEmailError'), trigger: ['blur', 'change'] },
    ],
    verificationCode: [
      { required: true, message: t('startVerificationCodeRequiredMsg'), trigger: 'blur' },
    ],
    password: [
      { required: true, message: t('startPasswordRequiredMsg'), trigger: 'blur' },
      {
        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@#$%^&*!]{8,20}$/,
        message: t('startPasswordError'),
        trigger: 'blur',
      },
    ],
    confirmPassword: [
      { required: true, message: t('startConfirmPasswordRequiredMsg'), trigger: 'blur' },
      { validator: validatePassword, trigger: 'blur' },
    ],
  }
})

watch([()=>userStore.email,()=>props.cType], (val) => {
  console.log('watch userStore.email', val)
  // form.email = newVal
  if(props.cType==='reset'){
    form.email = userStore.email
  }
})
onMounted(() => {
    console.log('reset')
})
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

function validatePassword(rule: any, value: string, callback: (error?: Error) => void) {
  if (value !== form.password) {
    callback(new Error(t('startConfirmPasswordError')))
  } else {
    callback()
  }
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (step.value === 1) {
        startSubmitText.value = t('confirm')
        title.value = t('startResetTitle')
        sendVerificationCode()
        step.value = 2
      }
      else if (step.value === 2) {
        loading.value = true
        userStore.verifyRecoverCode({
          email: form.email,
          code: form.verificationCode,
        })
          .then(() => {
            userStore.updateEmailPassword({
              email: form.email,
              code: form.verificationCode,
              newPassword: sha256(form.password).toString()
            })
              .then(() => {
                loading.value = false
                startSubmitText.value = t('returnToLogin')
                step.value = 3
              })
              .catch((err) => {
                ElMessage.error(err)
                loading.value = false
              })
          })
          .catch((err) => {
            loading.value = false
            ElMessage.error(err)
          })
      } else {
        emit('update:c-type', 'login')
      }
    }
  })
}

function startCountdown() {
  disabledCountdownBtn.value = true
  console.log('form?.email',form?.email)
  userStore.sendEmailCode({
    email:form?.email,
    language: lang.value == 'zh-cn' || lang.value == 'zh-tw' ? 'cn' : 'en',
    emailType: 'updatePassword',
  })
    .then(() => {
      isCounting.value = true // 开始倒计时
      loading2.value = false
      initCountdown()
      console.log(`验证码已发送到 ${form.email}`)
    })
    .catch((err) => {
      console.log('验证码已发送到',err)
      ElMessage.error(err)
      if (!timer.value) disabledCountdownBtn.value = false
      loading2.value = false
    })
  // formRef.value?.validateField('email', (valid) => {
  //   if (!valid) {
  //     // 发送验证码的逻辑
  //     disabledCountdownBtn.value = true
  //     userStore.sendEmailCode({
  //       email: form.email,
  //       language: lang.value == 'zh-cn' || lang.value == 'zh-tw' ? 'cn' : 'en',
  //       emailType: 'updatePassword',
  //     })
  //       .then(() => {
  //         isCounting.value = true // 开始倒计时
  //         loading2.value = false
  //         initCountdown()
  //         console.log(`验证码已发送到 ${form.email}`)
  //       })
  //       .catch((err) => {
  //         ElMessage.error(err)
  //         if (!timer.value) disabledCountdownBtn.value = false
  //         loading2.value = false
  //       })
  //   } else {
  //     console.log('邮箱格式不正确，无法发送验证码')
  //     loading2.value = false
  //   }
  // })
}

function initCountdown() {
  timer.value = setInterval(() => {
    if (count.value > 0) {
      count.value--
    } else {
      clearInterval(timer.value!) // 清除定时器
      timer.value = null
      resetCountdown() // 重置倒计时
    }
  }, 1000)
}

function resetCountdown() {
  disabledCountdownBtn.value = false
  isCounting.value = false // 停止倒计时
  count.value = 60 // 重置倒计时的值
}

function sendVerificationCode() {
  loading2.value = true
  startCountdown()
}
</script>

<style scoped lang='scss'>
.w-reset {
  .title {
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

  .title2 {
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    text-align: left;
    color: #999999;
    word-break: break-all;
  }

  .tip {
    margin: 0;
    color: #999999;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    width: calc(100% + 174.5px);
    text-align: center;
    margin-left: -87.25px;
  }

  .el-result {
    --el-result-title-margin-top: 10px;
    --el-result-padding: 10px 30px 40px 30px;

    :deep() p {
      font-size: 20px !important;
      font-weight: 500 !important;
      line-height: 30px !important;
      color: #F5F5F5;
    }
  }

  :deep() .el-form-item {
    font-size: 14px;
    font-weight: 400;
  }

  :deep() .el-input {
    height: 48px;
  }

  :deep() .el-button.is-link {
    color: #f5f5f5;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-form-item__label.icon {
    color: #f5f5f5;
    display: flex;
    justify-content: flex-start;
    width: 100%;
    height: 20px;
    line-height: 20px;
    font-style: 14px;
    padding-right: 0;
    margin-bottom: 0;
  }

  .btn {
    margin-top: 20px;
    height: 48px;

    &.step3 {
      margin-bottom: 44px;
    }

    :deep() &.el-button {}

    :deep() &.el-button.is-disabled,
    :deep() &.el-button.is-disabled:hover {}
  }

  .countdownBtn {
    &.el-button.is-link {
      font-weight: 400;
      color: #f5f5f5;

      &.is-disabled {
        color: #f5f5f5;

        &:hover {
          color: #f5f5f5;
        }
      }
    }
  }
}

.light {
  &.w-reset {
    .title {
      color: #222222;
    }

    .el-result {
      :deep() p {
        color: #333333;
      }
    }

    .countdownBtn {
      &.el-button.is-link {
        color: #333333;
        font-weight: 400;

        &.is-disabled {
          color: #333333;

          &:hover {
            color: #333333;
          }
        }
      }
    }
  }
}
</style>
