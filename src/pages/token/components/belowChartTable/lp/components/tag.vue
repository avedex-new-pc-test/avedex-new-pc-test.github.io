<template>
  <div :style="style" :class="klass" @click="emit('click',$event)">
    <slot/>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  click: [ event: MouseEvent ]
}>()
interface Props {
  type?: 'primary' | 'success' | 'danger'
  round?: boolean
  size?: 'large' | 'default' | 'small'
  color?: string
  bgColor?: string
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  round: true,
  size: 'default',
  color: '',
  bgColor: '',
  disabled: false
})
const style = ref<string[]>([])
const klass = ref<string[]>([])

watch(props , (val) => {
  const {type, round, size, color ,disabled ,bgColor} =val
  klass.value = ['default', type, size, !round ? 'noRound' : '', disabled ? 'disabled' : '']
  style.value = [`background-color:${bgColor}`, `color:${color}`]
} , { immediate: true })
</script>

<style lang="scss" scoped>
.default{
  display: flex;
  position: relative;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  color: #3F80F7;
  background-color: #3F80F71A;
  font-family: SF Pro;
  font-weight: 400;
  padding: 3px 8px;
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 0%;
  vertical-align: middle;
  border-radius: 4px;
  border: 0 none;
  &.primary{
    color: #3F80F7;
    background-color: #3F80F71A;
  }
  &.success{
    color: #12B886;
    background-color: #12B8861A;
  }
  &.danger{
    color: #F6465D;
    background-color: #F6465D1A;
  }
  &.large{
    padding: 4px 12px;
    font-size: 13px;
    border-radius: 6px;
  }
  &.default{
    padding: 3px 8px;
    font-size: 12px;
  }
  &.small{
    padding: 2px 4px;
    font-size: 10px;
  }
  &.noRound{
    border-radius: 0px;
  }
  &.disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }
}

</style>

