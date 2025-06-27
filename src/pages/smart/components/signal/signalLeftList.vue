<script setup lang="ts">
import {getSignalV2List} from '~/api/signal'

const listData = shallowRef([])
const listStatus = ref({
  loading: false,
  finished: false,
  error: false
})
const pageParams = shallowRef({
  pageNO: 1,
  pageSize: 20,
})

async function fetchSignalList(queryParams: Parameters<typeof getSignalV2List>) {
  try {
    listStatus.value.loading = true
    const res = await getSignalV2List({
      ...queryParams,
      ...pageParams.value
    })
    if (queryParams.value.pageNO === 1) {
      signalList.value = res || []
    } else {
      signalList.value = signalList.value.concat(res || [])
    }
    const finished = res?.length < queryParams.value.pageSize
    listStatus.value.finished = finished
    if (!finished) {
      queryParams.value.pageNO++
    }
  } catch (e) {
    listStatus.value.error = true
    signalList.value = []
  } finally {
    listStatus.value.loading = false
  }
}
</script>

<template>

</template>

<style scoped lang="scss">

</style>
