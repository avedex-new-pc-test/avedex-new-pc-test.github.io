<template>
  <header class="min-w-100vw">
    <div class="flex items-center">
      <NuxtLink to="/"><img src="~/assets/images/logo.svg" /></NuxtLink>
      <ul class="menu ml-20px">
        <li v-for="(item, $index) in list" :key="$index">
          <NuxtLink :to="item.src" :class="{ active: item.id == route?.name }">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
      <Icon class="clickable ml-auto text-20px" :name="themeStore.isDark ? 'custom:dark' : 'custom:light'" @click.stop="themeStore.toggleTheme()" />
      <el-button v-if="!botStore.evmAddress" class="ml-10px" @click="botStore.tgLogin">tg登录</el-button>
      <el-popover v-else placement="bottom" trigger="click">
        <template #reference>
          <el-button class="ml-10px">{{ botStore.userInfo?.name || '' }}</el-button>
        </template>
        <div class="text-center clickable" @click.stop="botStore.logout">退出登录</div>
      </el-popover>
    </div>
  </header>
</template>
<script lang="ts" setup>
const themeStore= useThemeStore()
const botStore = useBotStore()
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


