<template>
  <div :class="['w-emailRegister', mode]">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="0" autocomplete="off" size="large" @submit.prevent>
      <el-form-item label="" prop="email">
        <el-input v-model="form.email" :autocomplete="'new-email' + Math.random()" :placeholder="$t('startEmail')"
          name="emailField" />
      </el-form-item>

      <el-form-item label="" prop="verificationCode"
        v-if="cType == 'register' || (cType == 'login' && loginType == 'email')">
        <el-input v-model="form.verificationCode" :autocomplete="'new-verificationCode' + Math.random()"
          :placeholder="$t('startVerificationCode')" name="new-verificationCode">
          <template #suffix>
            <el-button class="countdownBtn" link @click="sendVerificationCode" :disabled="isCounting"
              :loading="loading2" :style="{
                color: mode == 'dark' ? '#286DFF' : '#286DFF',
              }">
              {{
                isCounting ? `${count}${$t("SS")}` : $t("startCountDown")
              }}</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="" prop="password" v-if="
        cType == 'register' || (cType == 'login' && loginType == 'password')
      ">
        <el-input v-model="form.password" type="password" name="password_field"
          :autocomplete="'new-password' + Math.random()" :placeholder="$t('startPassword')" show-password />
      </el-form-item>

      <el-form-item label="" prop="confirmPassword" v-if="cType == 'register'">
        <el-input v-model="form.confirmPassword" type="password" name="confirm_password_field"
          :placeholder="$t('startConfirmPassword')" :autocomplete="'new-password2' + Math.random()" show-password />
      </el-form-item>
      <el-form-item label-position="top" prop="refCode" v-if="cType == 'register'">
        <label class="el-form-item__label icon" @click="showRefCode = !showRefCode"
          :style="{ marginBottom: showRefCode ? '10px' : '0' }">
          <div style="
              gap: 8px;
              display: flex;
              align-items: center;
              cursor: pointer;
            ">
            {{ $t("startInvitationCode") }}
            <el-icon style="height: 5.5px; width: 9.5px">
              <ArrowUp v-if="showRefCode" />
              <ArrowDown v-else />
            </el-icon>
          </div>
        </label>
        <el-input v-if="showRefCode" v-model="form.refCode" autocomplete="off" :placeholder="$t('startInvitationCode')"
          :disabled="!!refCode" />
      </el-form-item>
      <el-form-item v-if="cType == 'login'" style="margin-bottom: 10px">
        <label class="el-form-item__label icon" :style="{ marginBottom: '0', justifyContent: 'space-between' }">
          <div style="
              gap: 8px;
              display: flex;
              align-items: center;
              cursor: pointer;
            " @click="loginType = loginType === 'password' ? 'email' : 'password'">
            {{
              loginType !== "email"
                ? $t("startVcodeLogin")
                : $t("startPwdLogin")
            }}
            <el-icon style="height: 11.33px; width: 13.33px">
              <Switch />
            </el-icon>
          </div>
          <div style="
              gap: 8px;
              display: flex;
              align-items: center;
              cursor: pointer;
            " @click.prevent="emit('update:cType', 'reset')">
            {{ $t("startForgetPassword") }}
          </div>
        </label>
      </el-form-item>
      <el-form-item :style="{ paddingTop: cType === 'login' ? '10px' : '0' }">
        <el-button class="btn" :color="mode == 'dark' ? '#F5F5F5' : '#222222'" size="large"
          :disabled="cType == 'register' && !form.agree" @click="submitForm" :loading="loading"
          style="width: 100%;--el-button-disabled-text-color:#222222">{{ $t("startSubmit") }}</el-button>
      </el-form-item>
      <p class="botFooter">
        <span :style="lang == 'en' ? { 'margin-right': '10px' } : ''">{{
          cType == "register" ? $t("startBotFooter11") : ''
        }}</span>
        <a v-if="cType == 'register'" href="javascript:void(0)" @click.prevent="emit('update:cType', 'login')">
          {{ $t("startBotFooter12") }}</a>
        <a v-else href="javascript:void(0)" @click.prevent="emit('update:cType', 'register')">
          {{ $t("register") }}</a>
      </p>
      <el-form-item v-if="cType == 'register'" size="small" style="height: 20px; line-height: 20px;margin-top: 20px;">
        <el-checkbox v-model="form.agree" style="color: #999;margin:0 auto">
          {{ $t("startFooter1") }}&nbsp;
          <el-link type="primary" :href="!lang?.includes?.('zh-')
            ? 'https://doc.ave.ai/cn/yong-hu-xie-yi'
            : 'https://doc.ave.ai/ave.ai-user-agreement'
            " target="_blank">&nbsp;{{ $t("startFooter2") }}</el-link>
          &nbsp;{{ $t("startFooter3") }}
          <el-link type="primary" href="https://ave.ai/privacy" target="_blank">
            &nbsp;{{ $t("startFooter4") }}</el-link>
        </el-checkbox>
      </el-form-item>
    </el-form>

    <el-divider class="w-divider" v-if="cType === 'login'">
      <span style='font-weight: 400;'>
        {{ $t("startTg") }}
      </span>
    </el-divider>
    <ul class="w-loginByThird" v-show="cType === 'login'">
      <li style="position: relative">
        <a href="javascript:void(0)" style="display: flex; position: relative; justify-content: center">
          <img v-show="loading4" class="googleLoading" src="@/assets/images/googleSVG.svg" alt="" width="36" height="36"
            style="cursor: pointer; border: none" />
          <div id="g_id_onload" :class="[loading4 ? 'loading' : '']"></div>
        </a>
      </li>
      <li>
        <a href="javascript:void(0)" style="display: inline-block" @click.stop="$f.connectBotWallet()"><img
            src="@/assets/images/tg.png" width="53" height="56" />
        </a>
      </li>
    </ul>
    <slot name="nav" v-if="cType == 'login'"></slot>
  </div>
  <loading v-model:active="loading3" :can-cancel="false" loader="dots" :opacity="0.2"
    :backgroundColor="mode === 'light' ? '#fff' : '#131722'" color="var(--custom-primary-color)"
    :is-full-page="false"></loading>
</template>

<script setup>
import {ArrowUp,ArrowDown,Switch} from '@element-plus/icons-vue'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
// import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Cookies from "js-cookie";
import sha256 from "crypto-js/sha256";
const botStore = useBotStore()
const { isDark } = useThemeStore()
const mode=computed(() => isDark?'dark':'light')

const lang = useLocaleStore().locale
const props = defineProps({
  cType: {
    type: String,
    required: true,
    validator: (value) => {
      return ["login", "register"].includes(value);
    },
  }
});

const emit = defineEmits(['update:cType']);

// const store = useStore();
const { t } = useI18n();

const count = ref(60);
const isCounting = ref(false);
const loading = ref(false);
const loading2 = ref(false);
const loading3 = ref(false);
const loading4 = ref(true);
const timer = ref(null);
const loginType = ref("password");
const showRefCode = ref(false);
const formRef = ref(null);

const form = ref({
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
  refCode: Cookies.get("refCode"),
  agree: false,
});

const refCode = ref(Cookies.get("refCode"));

const rules = computed(() => {
  return {
    email: [
      {
        required: true,
        message: t("startEmailRequiredMsg"),
        trigger: "blur",
      },
      {
        type: "email",
        message: t("startEmailError"),
        trigger: ["blur", "change"],
      },
    ],
    verificationCode: [
      {
        required: true,
        message: t("startVerificationCodeRequiredMsg"),
        trigger: "blur",
      },
    ],
    password: [
      {
        required: true,
        message: t("startPasswordRequiredMsg"),
        trigger: "blur",
      },
      {
        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@#$%^&*!]{8,20}$/,
        message: t("startPasswordError"),
        trigger: "blur",
      },
    ],
    confirmPassword: [
      {
        required: true,
        message: t("startConfirmPasswordRequiredMsg"),
        trigger: "blur",
      },
      { validator: validatePassword, trigger: "blur" },
    ],
  };
});

function validatePassword(rule, value, callback) {
  if (value !== form.value.password) {
    callback(new Error(t("startConfirmPasswordError")));
  } else {
    callback();
  }
}

function startCountdown() {
  formRef.value.validateField("email", (valid) => {
    // if (valid) {
    //   const lang = localStorage.language || Cookies.get("language") || "en";
    //   store.dispatch("sendEmailCode", {
    //     email: form.value.email,
    //     language: lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en",
    //     emailType: props.cType == "register" ? "register" : "login",
    //     refCode: form.value.refCode || refCode.value,
    //   })
    //     .then(() => {
    //       initCountdown();
    //       console.log(`验证码已发送到 ${form.value.email}`);
    //       loading2.value = false;
    //     })
    //     .catch((err) => {
    //       store.commit('showMessage', { type: 'error', text: err });
    //       loading2.value = false;
    //     });
    // } else {
    //   console.log("邮箱格式不正确，无法发送验证码");
    //   loading2.value = false;
    // }
  });
}

function initCountdown() {
  isCounting.value = true;
  timer.value = setInterval(() => {
    if (count.value > 0) {
      count.value--;
    } else {
      clearInterval(timer.value);
      resetCountdown();
    }
  }, 1000);
}

function resetCountdown() {
  isCounting.value = false;
  count.value = 60;
}

function sendVerificationCode() {
  loading2.value = true;
  startCountdown();
}

function login() {
  formRef.value.validate((valid) => {
    // if (valid) {
    //   const lang = localStorage.language || Cookies.get("language") || "en";
    //   const req = loginType.value === "password"
    //     ? store.dispatch("loginEmail", {
    //       email: form.value.email,
    //       password: sha256(form.value.password).toString(),
    //       language: lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en",
    //     })
    //     : store.dispatch("emailCodeLogin", {
    //       email: form.value.email,
    //       code: form.value.verificationCode,
    //       refCode: form.value.refCode || refCode.value,
    //       language: lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en",
    //     });

    //   req
    //     .then(() => {
    //       loading.value = false;
    //       store.commit("changeConnectVisible", false);
    //     })
    //     .catch((err) => {
    //       store.commit('showMessage', { type: 'error', text: err });
    //     })
    //     .finally(() => {
    //       loading.value = false;
    //     });
    // } else {
    //   console.log("登录失败");
    //   loading.value = false;
    //   return false;
    // }
  });
}

function register() {
  formRef.value.validate((valid) => {
    // if (valid) {
    //   const lang = localStorage.language || Cookies.get("language") || "en";
    //   const language = lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en";
    //   store.dispatch("registerEmail", {
    //     email: form.value.email,
    //     password: sha256(form.value.password).toString(),
    //     code: form.value.verificationCode,
    //     language,
    //     refCode: form.value.refCode || refCode.value,
    //   })
    //     .then(() => {
    //       loading.value = false;
    //       store.commit('showMessage', {
    //         type: 'success',
    //         text: language === "cn" ? "注册成功,去登录" : "Registration successful, go to log in"
    //       });
    //       setTimeout(() => {
    //         emit('update:cType', 'login')
    //       }, 1500);
    //     })
    //     .catch((err) => {
    //       store.commit('showMessage', { type: 'error', text: err });
    //     })
    //     .finally(() => {
    //       loading.value = false;
    //     });
    // } else {
    //   console.log("注册失败");
    //   loading.value = false;
    //   return false;
    // }
  });
}

function submitForm() {
  loading.value = true;
  if (props.cType == "login") {
    login();
  } else {
    register();
  }
}

function handleCredentialResponse(response) {
  console.log("Encoded JWT ID Token: " + response.credential);
  const lang = localStorage.language || Cookies.get("language") || "en";
  const language = lang == "zh-cn" || lang == "zh-tw" ? "cn" : "en";
  loading3.value = true;
  // store.dispatch("loginGoogle", {
  //   idToken: response.credential || "",
  //   refCode: form.value.refCode || refCode.value,
  // })
  //   .then(() => {
  //     store.commit('showMessage', {
  //       type: 'success',
  //       text: language === "cn" ? "登录成功" : "Log in successful"
  //     });
  //     loading3.value = false;
  //     store.commit("changeConnectVisible", false);
  //   })
  //   .catch((err) => {
  //     store.commit('showMessage', { type: 'error', text: err });
  //   })
  //   .finally(() => {
  //     loading3.value = false;
  //   });
}

function initGoogleLogin() {
  if (!window.google) return;
  google.accounts.id.initialize({
    client_id: "631329100197-b57e5f06avvas9cdojmlp9d7imst26u2.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById("g_id_onload"), {
    type: "icon",
    shape: "circle",
    theme: "outline",
    text: "signin_with",
    size: "large",
  });
  const iframe = document.querySelector("#g_id_onload iframe");
  const button = document.querySelector('#g_id_onload div[role="button"]');
  if (button) {
    button.style = `display: none;`;
  }
  if (!iframe) return;
  iframe.style = `display: none;`;
  iframe.onload = () => {
    iframe.style = `
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 56px;
      opacity: 0; 
      pointer-events: auto; 
      z-index: 1; 
    `;
    loading4.value = false;
  };
}

onMounted(() => {
  console.log("login mounted");
  formRef.value?.resetFields();
  loading4.value = true;
  const gsiClientEl = document.querySelector("#gsiClient");
  if (!gsiClientEl) {
    const script = document.createElement("script");
    script.id = "gsiClient";
    script.src = "https://accounts.google.com/gsi/client";
    document.body.appendChild(script);
    script.onload = () => {
      initGoogleLogin();
    };
  } else {
    initGoogleLogin();
  }
});

// watch(() => form.value.email, (newEmail) => {
//   store.email = newEmail;
// });

watch(() => botStore.connectVisible, (val) => {
  formRef.value?.resetFields();
  form.value.agree = false;
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style style="scss" scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.w-divider {
  border-color: #333;
  margin: 27px 0;
  --el-bg-color: #222222;
  --el-text-color-primary: #999999;
}

.w-emailRegister {
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
    height: 48px;

    :deep() &.el-button {
      /* color: #000000;
      background-color: #F5F5F5; */
    }

    :deep() &.el-button.is-disabled,
    :deep() &.el-button.is-disabled:hover {
      /* color: #000000;
      background-color: rgb(248, 248, 248); */
    }
  }

  .el-link.el-link--primary {
    --el-link-text-color: #f5f5f5;
    --el-link-hover-text-color: #f5f5f5;
    font-size: 12px !important;
    line-height: 12px !important;
  }

  :deep(.el-checkbox__label) {
    font-size: 12px !important;
    line-height: 12px !important;
    display: flex;
    align-items: center;
  }

  :deep() .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #999;
  }

  :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #333;
    border-color: #999;
  }

  :deep() .el-checkbox__inner:hover {
    border-color: #f5f5f5;
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

  ul.w-loginByThird {
    display: flex;
    justify-content: center;
    gap: 38px;
    align-items: flex-start;
    flex-wrap: nowrap;

    .googleLoading {
      display: inline-block;
      width: 36px;
      height: 36px;
      position: absolute;
      color: transparent;
      top: 0;
      transform-origin: center center;
      animation: rotate 1s linear infinite;
    }
  }

  .botFooter {
    color: #999999;
    display: flex;
    font-size: 14px;
    height: 20px;
    margin: 0;
    margin-top: 20px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    font-weight: 400;

    a {
      color: #F5F5F5;
      display: inline-block;
      line-height: 16.8px;
    }
  }

  .loginByOther {
    color: #999999;
    font-size: 12px;
    font-weight: 400;
    display: flex;
    margin: 0;
    padding: 0;
    margin-top: 20px;
    justify-content: center;
    align-items: center;

    a {
      color: #999999;
      font-size: 12px;
      font-weight: 400;
      display: flex;
      margin: 0;
      justify-content: center;
    }
  }
}

.light {
  &.w-emailRegister {
    .btn {
      :deep() &.el-button {
        /* color: #F5F5F5;
        background-color: #333333; */
      }

      :deep() &.el-button.is-disabled,
      :deep() &.el-button.is-disabled:hover {
        /* color: #F5F5F5;
        background-color: #333333c2; */
      }
    }

    .el-link.el-link--primary {
      --el-link-text-color: #333333;
      --el-link-hover-text-color: #333333;
    }

    :deep() .el-checkbox__input.is-checked+.el-checkbox__label {
      color: #999;

      &::hover {
        color: #999;
      }
    }

    :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #333;
      border-color: #999;
    }

    :deep() .el-checkbox__inner {
      border-color: var(--custom-font-1-color);
    }

    :deep() .el-checkbox__inner:hover {
      border-color: var(--custom-font-1-color);
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

    .w-divider {
      color: #ffffff;
      border-color: #d8d8dc;
      --el-bg-color: #ffffff;
      --el-text-color-primary: #999;
    }

    .botFooter {
      a {
        color: #222222;
        display: inline-block;
      }
    }

    .el-form-item__label.icon {
      color: #333333;
    }
  }
}

:deep() #g_id_onload {
  width: 40px;
  height: 56px;
  background: url("@/assets/images/google.png") center no-repeat;
  background-size: cover;

  &.loading {
    background: url("@/assets/images/googleLoading.png") center no-repeat;
    background-size: cover;
  }
}
</style>