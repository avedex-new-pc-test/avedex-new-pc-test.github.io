<template>
  <el-table-column v-for="{prefix,suffix,customClassName,customStyle,customFormatter,multiple,...col} in columns" :key="col.prop || col.label" v-bind="col">
    <template #default="{ row }">
      <div 
        :class="customClassName ? (typeof customClassName === 'function' ? customClassName(row) : customClassName) : ''"
        :style="customStyle ? (typeof customStyle === 'function' ? customStyle(row) : customStyle) : ''">
        <span v-if="prefix" class="prefix">{{ typeof prefix === 'function' ? prefix(row) : prefix }}</span>
        <slot v-if="slots.default" :row="row"/>
        <template v-else>
          <span v-if="row[col.prop] === '--'">--</span>
          <span v-else-if="row[col.prop] === 0">0</span>
          <span v-else-if="customFormatter">{{ typeof customFormatter === 'function' ? customFormatter(row) : customFormatter }}</span>
          <span v-else>{{ row[col.prop] }}</span>
        </template>
        <span v-if="suffix" class="suffix">{{ typeof suffix === 'function' ? suffix(row) : suffix }}</span>
      </div>
    </template>
  </el-table-column>
  
</template>

<script setup lang="ts">
import type { TableColumnCtx } from 'element-plus'

type customType = string | ((row: any) => string )
export interface IColumn extends TableColumnCtx<any> {
  //单元格是否展示多个值
  multiple?: false | [{prefix?: customType, suffix?: customType,customClassName?: customType,customStyle?: customType,customFormatter?: (row: any) => string|number|null}],
  prefix?: customType,
  suffix?: customType,
  customClassName?: customType,
  customStyle?: customType,
  customFormatter?: (row: any) => string|number|null
}

interface Props {
  columns?: IColumn[]
}
withDefaults(defineProps<Props>(), {
  columns: () => []
})
const slots = useSlots()
const _customFormatter=computed(() => {
  return (row: any) => {

  }
})
</script>

<style scoped>

</style>

