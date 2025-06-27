<script setup lang="ts">
import {getSignalV2List, type GetSignalV2ListResponse} from '~/api/signal'

const listData = shallowRef<GetSignalV2ListResponse[]>([])
const listStatus = ref({
  loading: false,
  finished: false,
  error: false
})
const pageParams = shallowRef({
  pageNO: 1,
  pageSize: 20,
})

defineExpose({
  fetchSignalList: (queryParams: Parameters<typeof fetchSignalList>[0]) => {
    pageParams.value.pageNO = 1
    fetchSignalList(queryParams)
  }
})

async function fetchSignalList(queryParams: Exclude<Exclude<Parameters<typeof getSignalV2List>[0], 'pageNO'>, 'pageSize'>) {
  try {
    listStatus.value.loading = true
    const res = await getSignalV2List({
      ...queryParams,
      ...pageParams.value
    })
    if (pageParams.value.pageNO === 1) {
      listData.value = res || []
    } else {
      listData.value = listData.value.concat(res || [])
    }
    const finished = res?.length < pageParams.value.pageSize
    listStatus.value.finished = finished
    if (!finished) {
      pageParams.value.pageNO++
    }
  } catch (e) {
    console.log(e, 'error')
    listStatus.value.error = true
    listData.value = []
  } finally {
    listStatus.value.loading = false
  }
}
</script>

<template>

</template>

<style scoped lang="scss">

</style>
