<template>
  <div></div>
</template>

<script setup lang='ts'>

defineProps<{
  msg: string
}>()

onMounted(() => {
  console.log('mounted')
})

</script>

<style scoped lang='scss'>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
