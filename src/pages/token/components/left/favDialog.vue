<script setup lang="ts">
import type {GetUserFavoriteGroupsResponse} from '~/api/fav'

const props = defineProps({
  visible: Boolean,
  isScroll: Boolean,
  loading: Boolean,
  list: {
    type: Array<GetUserFavoriteGroupsResponse>,
    default: () => []
  },
  getData: {
    type: Function,
    default: () => {
    }
  }
})
const {t} = useI18n()
const emit = defineEmits(['update:visible'])
const {theme} = useThemeStore()
const activeTab = shallowRef('dialogFavoriteManage')

const show = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})
const tabs = computed(() => [
  {name: t('favoriteManage'), id: 'dialogFavoriteManage'},
  {name: t('groupManage'), id: 'dialogGroupManage'}
])
const components = {
  dialogFavoriteManage: defineAsyncComponent(() => import('./dialogFavoriteManage.vue')),
  dialogGroupManage: defineAsyncComponent(() => import('./dialogGroupManage.vue')),
}

watch(show, (val) => {
  if (val) {
    props.getData()
  }

})

const Component = computed(() => {
  const id = tabs.value.find(el => el.id === activeTab.value)?.id as keyof typeof components
  return components[id] || components.dialogFavoriteManage
})
</script>

<template>
  <el-dialog
    v-model="show"
    append-to-body
    width="800px"
    :class="theme"
  >
    <template #header>
      <div
        class="flex items-center justify-between"
      >
        <div
          class="w-full text-left text-16px mt-5px ml-4px"
        >
          <a
            v-for="(item, $index) in tabs"
            :key="$index" href="javascript:;"
            :class="`decoration-none inline-block min-w-88px rounded-20px text-16px  pr-15px
              ${item.id === activeTab?'color-[var(--d-F5F5F5-l-333)]':'color-#80838b'}`"
            @click.stop.prevent="activeTab=item.id"
          >
            {{ item.name }}
          </a>
        </div>
      </div>
    </template>

    <component :is="Component" :list="list" :get-data="getData" :loading="loading"/>
  </el-dialog>
</template>

<style scoped>

</style>
