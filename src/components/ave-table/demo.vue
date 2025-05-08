<script setup lang="ts">
import type {RowEventHandlers} from 'element-plus'
import type {AveTable} from '#components'

const columns = [
  {key: 'name', dataKey: 'name', title: '姓名', width: 100},
  {key: 'age', dataKey: 'age', title: '年龄'},
  {key: 'address', dataKey: 'address', title: '地址'},
]

const data = ref([
  {name: '张三张三张三张三张三张三', age: 18, address: '北京'},
  {name: '李四', age: 22, address: '上海'},
  {name: '王五', age: 30, address: '广州'},
  {name: '赵六', age: 25, address: '深圳'},
  {name: '刘伟', age: 28, address: '杭州'},
  {name: '陈芳', age: 24, address: '成都'},
  {name: '杨娜', age: 32, address: '武汉'},
  {name: '黄秀英', age: 19, address: '南京'},
  {name: '周敏', age: 27, address: '西安'},
  {name: '吴静', age: 23, address: '重庆'},
  {name: '张丽', age: 31, address: '北京'},
  {name: '李强', age: 26, address: '上海'},
  {name: '王磊', age: 29, address: '广州'},
])
const tableRef = useTemplateRef<InstanceType<typeof AveTable>>('tableRef')
onMounted(() => {
  setTimeout(() => {
    tableRef.value?.scrollTo?.({scrollTop: 100})
  }, 100)
})

const rowEventHandlers: RowEventHandlers = {
  onClick: e => {
    console.log('=>(demo.vue:19) e', e)
  }
}

function onLoad() {
  setTimeout(() => {
    data.value.push(...data.value)
  }, 1000)
}
</script>

<template>
  <AveTable
    ref="tableRef"
    show-empty-text
    :columns="columns"
    :data="data"
    :row-event-handlers="rowEventHandlers"
    @end-reached="onLoad"
  >
    <template #cell-name="{ row }">
      <span style="color: red">{{ row.name }}</span>
    </template>
    <template #header-age>
      <b>年龄（岁）</b>
    </template>
    <template #cell-address="{ row }">
      <el-tag>{{ row.address }}</el-tag>
    </template>
  </AveTable>
</template>

<style scoped>

</style>
