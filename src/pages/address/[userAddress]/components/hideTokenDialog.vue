<script setup>
import {computed, defineProps, defineEmits, ref} from 'vue'
import {setUserTokenStatus} from '@/api/wallet'

const {t} = useI18n()
const props = defineProps({
  row: {
    type: Object,
    default: () => ({})
  },
  modelValue: Boolean,
  self_address: String
})

const themeStore = useThemeStore()
const emit = defineEmits(['update:modelValue', 'hideToken'])
const loading = ref(false)
const hideTokenVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

async function confirm() {
  try {
    loading.value = true
    const {token, chain} = props.row
    await setUserTokenStatus({
      token,
      type: 'blacklist'
    }, props.self_address, chain)
    ElMessage.success(t('success'))
    hideTokenVisible.value = false
    emit('hideToken')
  } catch (e) {
    console.log('=>(tokenList.vue:742) e', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="hide-token">
    <el-dialog
      v-model="hideTokenVisible"
      :title="$t('ConfirmHideToken')"
      class="dialog"
      width="440"
    >
      <div class="hide-token-container">
        <label class="hide-token-label">{{ $t('TokenName') }}</label>
        <div class="hide-token-value">
          {{ row.symbol }}
        </div>
        <label class="hide-token-label">{{ $t('ContractAddress') }}</label>
        <div class="hide-token-value">
          {{ row.token }}
        </div>
        <div class="flex items-center">
          <el-button
            :color="themeStore.isDark ? '#333' : '#f2f2f2'"
            size="default"
            class="hide-token-cancel"
            @click.stop="hideTokenVisible=false">
            {{ $t('cancel') }}
          </el-button>
          <el-button
            :color="themeStore.isDark ? '#f5f5f5' : '#222'"
            size="default"
            class="hide-token-ok"
            type="primary"
            :loading="loading"
            @click.stop="confirm"
          >
            {{ $t('Hide') }}
          </el-button>
        </div>
        <div class="d-fff-l-333 font-12 mt_20">
          *{{ $t('BlockTips') }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.hide-token {
  :deep() {
    .dialog {
      --el-dialog-padding-primary: 30px 0 0;
      --el-dialog-bg-color: var(--d-222-l-fff);

      .el-dialog__close {
        color: var(--d-F5F5F5-l-222);
      }
    }

    .el-dialog__header {
      display: flex;
      align-items: center;
      padding: 0 20px 20px;
      font-weight: 500;
      font-size: 24px;
      line-height: 30px;
      border-bottom: 1px solid var(--d-333333-l-F2F2F2);
    }

    .el-dialog__headerbtn {
      top: 22px;
    }

    .el-input__wrapper {
      background: var(--a-bg-7-color);
      box-shadow: none;

      .el-input__inner {
        color: var(--a-text-1-color);
      }
    }
  }

  .hide-token-container {
    padding: 20px;
  }

  .hide-token-label {
    color: var(--d-333-l-f5f5f5);
    line-height: 18px;
  }

  .hide-token-value {
    margin-top: 10px;
    margin-bottom: 20px;
    padding: 10px;
    height: 36px;
    border-radius: 4px;
    color: var(--d-666-l-999);
    background-color: var(--d-333333-l-F2F2F2);
  }

  .hide-token-cancel, .hide-token-ok {
    flex: 1;
    height: 40px;
  }

  .hide-token-cancel {
    color: #959a9F;
    background: var(--d-333333-l-F2F2F2);
    border-color: var(--d-333333-l-F2F2F2);
  }

  .hide-token-ok {
    color: var(--d-333333-l-F5F5F5);
    background: var(--d-F5F5F5-l-333333);
    border-color: var(--d-F5F5F5-l-333333);
  }

  .d-fff-l-333 {
    color: var(--d-fff-l-333);
  }
}
</style>
