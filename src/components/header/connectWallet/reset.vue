<template>
  <div :class="['w-reset', $store.state.mode]">
    <h3 v-if="step !== 3" class="title" :style="{ marginBottom: step === 2 ? '40px' : 0 }">{{ title }}
      <el-icon  @click="this.$emit('update:cType', 'login')" :size="35" style="color:var(--d-999-l-222);">
        <ArrowLeft />
      </el-icon>
    </h3>
    <h3 v-if="step === 2" class="title2">{{ $t('startResetTitle2') }}({{ $f.desensitizeEmail(form.email) }})</h3>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="0" autocomplete="off" size="large" @submit.prevent
      :style="{marginTop: step === 1?'100px':'10px'}">
      <el-form-item v-if="step === 1" label="" prop="email">
        <el-input v-model="form.email" :autocomplete="'new-email' + Math.random()" :placeholder="$t('startEmail')"
          name="emailField" />
      </el-form-item>
      <template v-else-if="step === 2">
        <el-form-item label="" prop="verificationCode">
          <el-input v-model="form.verificationCode" :autocomplete="'new-verificationCode' + Math.random()"
            :placeholder="$t('startVerificationCode')" name="new-verificationCode">
            <template #suffix>
              <el-button class="countdownBtn" link @click="sendVerificationCode" :disabled="disabledCountdownBtn"
                :loading="loading2" :style="{
                  color: this.$store.state.mode == 'dark' ? '#f5f5f5' : '#333333',
                }">
                {{
                  isCounting ? `${count}${$t("SS")}` : $t("startCountDown")
                }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input v-model="form.password" type="password" name="password_field"
            :autocomplete="'new-password' + Math.random()" :placeholder="$t('startPassword')" show-password />
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" name="confirm_password_field"
            :placeholder="$t('startConfirmPassword')" :autocomplete="'new-password2' + Math.random()" show-password />
        </el-form-item>
      </template>
      <el-result v-else :title="$t('startSuccessTitle')">
        <template #icon>
          <img src="@/assets/images/success.svg" width="80px" />
        </template>
      </el-result>
      <el-form-item>
        <el-button :color="$store.state.mode=='dark'?'#F5F5F5':'#222222'"  :class="['btn', (step === 3) && 'step3']" size="large" 
          @click="submitForm" :loading="loading" style="width: 100%">{{ startSubmitText }}</el-button>
      </el-form-item>
      <p v-if="step === 2" class="tip">{{ $t('startResetTip') }}</p>
    </el-form>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import sha256 from "crypto-js/sha256";

export default {
  name: 'Reset',
  components: {
    // Email,
  },
  data() {
    return {
      count: 60, // 倒计时的初始值
      isCounting: false, // 是否正在倒计时
      disabledCountdownBtn: false,
      loading: false,
      loading2: false,
      title: this.$t('startForgetPassword'),
      startSubmitText: this.$t("next"),
      step: 1,
      form: {
        email: this.$store.email,
        verificationCode: '',
        password: '',
        confirmPassword: '',
      },
      rules: this.getValidationRules(),
    };
  },
  watch: {
    email(newVal) {
      this.form.email = newVal; // 更新表单中的 email 字段
    },
  },
  methods: {
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (this.step === 1) {
            this.startSubmitText = this.$t("confirm"),
            this.title = this.$t("startResetTitle"),
            this.sendVerificationCode()
            this.step = 2
          }
          else if (this.step === 2) {
            this.loading = true;
            this.$store
              .dispatch("verifyRecoverCode", {
                email: this.form.email,
                code: this.form.verificationCode,
              })
              .then(() => {
                // "email":"xxx@xxx.com",
                // "newPassword":"xxxxxxx",
                // "code":"123321",
                this.$store
                  .dispatch("updateEmailPassword", {
                    email: this.form.email,
                    code: this.form.verificationCode,
                    newPassword: sha256(this.form.password).toString()
                  })
                  .then(() => {
                    this.loading = false;
                    this.startSubmitText = this.$t("returnToLogin"),
                      this.step = 3;
                  })
                  .catch((err) => {
                    this.$message.error(err);
                    this.loading = false;
                  });
              })
              .catch((err) => {
                this.loading = false;
                this.$message.error(err);
              });
          } else {
            this.$emit('update:cType', 'login')
          }
        } else {
          return false;
        }
      })

    },
    startCountdown() {
      this.$refs.formRef.validateField("email", (valid) => {
        if (valid) {
          // 发送验证码的逻辑
          const lang = localStorage.language || Cookies.get("language") || "en";
          this.disabledCountdownBtn = true;
          this.$store
            .dispatch("sendEmailCode", {
              email: this.form.email,
              language: lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en",
              emailType: "updatePassword",
            })
            .then(() => {
              this.isCounting = true; // 开始倒计时
              this.loading2 = false;
              this.initCountdown();
              console.log(`验证码已发送到 ${this.form.email}`);
            })
            .catch((err) => {
              this.$message.error(err);
              if(!this.timer)this.disabledCountdownBtn = false;
              this.loading2 = false;
            });
        } else {
          console.log("邮箱格式不正确，无法发送验证码");
          this.loading2 = false;
        }
      });
    },
    initCountdown() {
      this.timer = setInterval(() => {
        if (this.count > 0) {
          this.count--;
        } else {
          clearInterval(this.timer); // 清除定时器
          this.timer=null;
          this.resetCountdown(); // 重置倒计时
        }
      }, 1000);
    },
    resetCountdown() {
      this.disabledCountdownBtn = false;
      this.isCounting = false; // 停止倒计时
      this.count = 60; // 重置倒计时的值
    },
    sendVerificationCode() {
      this.loading2 = true;
      this.startCountdown();
      // 发送验证码的逻辑
      console.log("验证码已发送");
    },
    getValidationRules() {
      return {
        email: [
          { required: true, message: this.$t('startEmailRequiredMsg'), trigger: 'blur' },
          { type: 'email', message: this.$t('startEmailError'), trigger: ['blur', 'change'] },
        ],
        verificationCode: [
          { required: true, message: this.$t('startVerificationCodeRequiredMsg'), trigger: 'blur' },
        ],
        password: [
          { required: true, message: this.$t('startPasswordRequiredMsg'), trigger: 'blur' },
          {
            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@#$%^&*!]{8,20}$/,
            message: this.$t('startPasswordError'),
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: this.$t('startConfirmPasswordRequiredMsg'), trigger: 'blur' },
          { validator: this.validatePassword, trigger: 'blur' },
        ],
      };
    },
    validatePassword(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error(this.$t('startConfirmPasswordError')));
      } else {
        callback();
      }
    },
  },
};
</script>

<style scoped lang="scss">
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
