<script setup lang="ts">
import {formatImgUrl} from '~/utils'

const emit = defineEmits(['update:userIds'])
defineProps({
  userIds: {
    type: Array,
    default: () => []
  }
})
const {userInfo, isSupportChains} = useBotStore()
const visible = shallowRef(false)
const options = shallowRef(isSupportChains)
const selectedChains = shallowRef<string[]>([...isSupportChains])

const {isDark} = useThemeStore()
const displayChains = computed(() => {
  return selectedChains.value.slice(0, 2)
})

function getDisabled(val: string) {
  return selectedChains.value.length <= 1 && selectedChains.value.includes(val)
}

function onConfirm() {
  if (userInfo && Array.isArray(userInfo.addresses)) {
    const arr: string[] = []
    userInfo.addresses.map(el => {
      if (selectedChains.value.includes(el.chain)) {
        arr.push(el.address + '-' + el.chain)
      }
    })
    emit('update:userIds', arr)
  }
  visible.value = false
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <div
      class="flex h-20px"
  >
    <el-popover
        ref="popoverRef"
        v-model:visible="visible"
        placement="bottom"
        trigger="click"
        :popper-style="{ padding: '20px 16px',width: 'auto', minWidth: '164px' }"
    >
      <template
          #reference
      >
        <div>
          <el-button
              size="small"
              class="[&&]:px-3px [&&]:py-4px justify-between"
          >
            <img
                v-for="item in displayChains"
                :key="item"
                height="14"
                class="rounded-50%"
                :src="formatImgUrl('chain',item)"
                alt="">
            <span>{{ selectedChains.length }}</span>
          </el-button>
        </div>
      </template>
      <div
          class="py-8px color-#f5f5f5 [--el-checkbox-checked-bg-color:#000] [--el-checkbox-checked-input-border-color:#000] checkbox-container"
      >
        <el-checkbox-group
            v-model="selectedChains"
        >
          <el-checkbox
              v-for="item in options" :key="item"
              :value="item"
              :disabled="getDisabled(item)"
              class="custom-checkbox"
          >
            {{ item }}
          </el-checkbox>
        </el-checkbox-group>
        <div class="mt-12px flex justify-between">
          <el-button
              size="small"
              class="h-30px min-w-60px [--el-button-font-weight: 400]"
              :color="isDark?'#333':'#f2f2f2'"
              @click="onCancel"
          >
            {{ $t('cancel') }}
          </el-button>
          <el-button
              size="small" type="primary"
              class="h-30px min-w-60px [--el-button-font-weight: 400]"
              :color="isDark?'#f5f5f5':'#222'"
              :disabled="selectedChains.length === 0"
              @click="onConfirm"
          >
            {{ $t('confirm') }}
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<style lang="css" scoped>
.custom-checkbox {
  --at-apply: flex items-center h-32px m-0;
}
</style>
