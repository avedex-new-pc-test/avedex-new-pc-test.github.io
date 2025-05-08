<script setup lang="ts">
import type {Column, TableV2Instance} from "element-plus"
import {useElementSize} from "@vueuse/core"

const {t} = useI18n()
const props = defineProps({
  columns: {
    type: Array<Partial<Column>>,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  showEmptyText: Boolean,
  emptyText: {
    type: String,
    default: ''
  },
  footerHeight: {
    type: Number,
    default: 50
  },
  loading: Boolean
})

const slots = useSlots()
const attrs = useAttrs()
const {theme} = useThemeStore()
const tableRef = useTemplateRef<TableV2Instance>('tableRef')
defineExpose({
  scrollTo: (...args: Parameters<TableV2Instance['scrollTo']>) => {
    tableRef.value?.scrollTo?.(...args)
  },
  scrollToLeft: (...args: Parameters<TableV2Instance['scrollToLeft']>) => {
    tableRef.value?.scrollToLeft?.(...args)
  },
  scrollToTop: (...args: Parameters<TableV2Instance['scrollToTop']>) => {
    tableRef.value?.scrollToTop?.(...args)
  },
  scrollToRow: (...args: Parameters<TableV2Instance['scrollToRow']>) => {
    tableRef.value?.scrollToRow?.(...args)
  }
})
const {width: elTableWidth} = useElementSize(tableRef)

// 只收集 el-table-v2 的官方默认插槽
const TABLE_V2_DEFAULT_SLOTS = [
  'empty',
  'footer',
  'overlay',
  'row',
  'cell',
  'header-cell',
]

const defaultSlots = computed(() => {
  const s: Record<string, any> = {}
  for (const key of TABLE_V2_DEFAULT_SLOTS) {
    if (slots[key]) s[key] = slots[key]
  }
  return s
})

// 处理 columns，注入 cellRenderer/headerCellRenderer
const computedColumns = computed(() => {
  const avgWidth = getAvgWidth()
  return props.columns.map((col: any) => {
    // 支持 key 或 dataKey
    const cellSlot = slots[`cell-${col.key}`] || slots[`cell-${col.dataKey}`]
    const headerSlot = slots[`header-${col.key}`] || slots[`header-${col.dataKey}`]
    return {
      ...col,
      cellRenderer: cellSlot
        ? ({rowData, column, rowIndex, columnIndex}: any) =>
          cellSlot({row: rowData, column, rowIndex, columnIndex})
        : col.cellRenderer,
      headerCellRenderer: headerSlot
        ? ({column}: any) => headerSlot({column})
        : col.headerCellRenderer,
      width: col.width || avgWidth
    }
  })
})

// 获取平均宽度
function getAvgWidth() {
  let avgNum = 0
  const sumWidth = props.columns.reduce((prev, cur) => {
    if (cur.width) {
      return prev + cur.width
    } else {
      avgNum++
    }
    return prev
  }, 0)
  return ((elTableWidth.value - sumWidth) / avgNum) | 0
}
</script>

<template>
  <el-auto-resizer>
    <template #default="{ height, width }">
      <!-- 透传所有 $attrs，支持 el-table-v2 的其它属性 -->
      <ElTableV2
        ref="tableRef"
        v-bind="attrs"
        :columns="computedColumns"
        :data="data"
        :height="height"
        :width="width"
        :footer-height="footerHeight"
      >
        <template v-for="(slotFn, slotName) in defaultSlots" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps"/>
        </template>
        <!--如果没有自定义空样式则使用默认值-->
        <template v-if="!defaultSlots.empty && !loading" #empty>
          <div class="h-full flex flex-col items-center justify-center">
            <img v-if="theme==='light'" src="@/assets/images/empty-white.svg" alt="">
            <img v-else src="@/assets/images/empty-black.svg" alt="">
            <span
              v-if="showEmptyText"
              class="mt-10px"
            >
              {{ emptyText || t('emptyNoData') }}
            </span>
          </div>
        </template>
      </ElTableV2>
    </template>
  </el-auto-resizer>
</template>

<style scoped>

</style>
