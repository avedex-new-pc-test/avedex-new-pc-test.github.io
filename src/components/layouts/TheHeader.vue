<template>
  <header>
    <div class="flex">
      <NuxtLink to="/"><img src="~/assets/images/logo.svg" /></NuxtLink>
      <ul class="menu ml-20px">
        <li><NuxtLink to="/token">Market</NuxtLink></li>
        <li><NuxtLink to="/token">Market</NuxtLink></li>11

      </ul>
    </div>

  </header>
</template>


<script setup lang='ts'>
</script>
<style lang="scss" scoped>
header{
  padding: 18px 17px;
ul {
  display: flex;
  li a {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: center;
    padding: 4px 8px;
    border-radius: 8px;
    color: #999999;
    margin-right: 8px;
    text-decoration:none;
    &.active {
      background: #3f80f71a;
      color: #3F80F7;
    }
  }
}
}
</style>


