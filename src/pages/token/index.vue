<template>
   <div class="a">
    <button class="b"> {{ $t('connectWallet') }}</button>

   </div>
</template>

<script setup lang='ts'>
  // console.log('token', useRoute().params.id)
  // setTimeout(() => {
  //   useLocaleStore().locale = 'zh-cn'

  //   console.log('lang', localStorage.getItem('language'))
  // }, 5000);
</script>

<style scoped lang="scss">
  .a {
    .b {
      background-color: red;
    }
  }
</style>
