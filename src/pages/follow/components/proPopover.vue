<template>
  <el-popover ref="popoverRef" :width="width" trigger="click" placement="bottom" :virtual-ref="props.buttonRef" virtual-triggering :title="props.title" :persistent="false" :teleported="true" >
    <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent.stop="handleSubmit(formRef)">
      <el-form-item :prop="props.prop" :required="props.required" label-position="top">
        <el-input v-model="form[props.prop]" :placeholder="placeholder" :maxlength="props.maxlength"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.stop.prevent="handleCancel">{{ $t('cancel') }}</el-button>
        <el-button native-type="submit">{{ $t('confirm') }}</el-button>
      </el-form-item>
    </el-form>
  </el-popover>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
const { t } = useI18n()
const {lang} = storeToRefs(useGlobalStore())
const props=defineProps({
  width:{
    type:String,
    default:'200'
  },
  required:{
    type:Boolean,
    default:true
  },
  label:{
    type:String,
    default:''
  },
  prop:{
    type:String,
    default:''
  },
  placeholder:{
    type:String,
    default:''
  },
  modelValue:{
    type:String,
    default:''
  },
  rule:{
    type:Function,
    default:()=>{}
  },
  buttonRef:{
    type:Object,
    required:true
  },
  maxlength:{
    type:Number,
    default:20
  },
  title: {
    type: String,
    default: ''
  }
})
const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue', value: string): void
  (e: 'onConfirm', value?: string): void
  (e: 'onCancel'): void
}>()

const popoverRef=ref()
const placeholder=computed(() => props.placeholder ?? t('placeholderPrefix') + props.label)

const rules = computed<FormRules>(() => {
  return {
    [props.prop]: [
      { required: props.required, message: props.label + (lang.value.indexOf('zh') > -1 ? '' : '&nbsp;') + t('cannotBeEmpty'), trigger: 'blur' }
    ]
  }
})
const formRef=ref<FormInstance|undefined>()

const form = reactive({
  [props.prop]: props.modelValue
})
watch(() => form[props.prop], (newValue) => {
  emits('update:modelValue', newValue)
})

function handleSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      emits('onConfirm',form[props.prop])
    } else {
      console.log('error submit!', fields)
    }
  })
}
function handleCancel() {
  close()
}
function close() {
  unref(popoverRef)?.hide?.()
}
defineExpose({
  close
})
</script>

<style scoped>
.el-popover__reference {
  margin-bottom: 10px;
}
</style>

