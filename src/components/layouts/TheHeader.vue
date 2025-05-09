<template>
  <header>
    <div class="flex">
      <NuxtLink to="/"><img src="~/assets/images/logo.svg" /></NuxtLink>
      <ul class="menu ml-20px">
        <li v-for="(item, $index) in list" :key="$index">
          <NuxtLink :to="item.src" :class="{ active: item.id == route?.name }">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <button @click="themeStore.toggleTheme()"> 切换主题</button>
  </header>
</template>
<script lang="ts" setup>
const themeStore= useThemeStore()
const route = useRoute()
const list = shallowRef([
  { id: 'index', name: 'Home', src: '/' },
  { id: 'token', name: 'Token', src: '/token' }
])

</script>
<style lang="scss" scoped>
header {
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
      text-decoration: none;
      &.active {
        background: #3f80f71a;
        color: #3f80f7;
      }
    }
  }
}
</style>


