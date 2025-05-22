<template>
  <header
    class="w-full bg-[var(--d-111-l-FFF)] flex items-center justify-between p-x-17px h-60px"
  >
    <NuxtLink to="/"><img src="~/assets/images/logo.svg" /></NuxtLink>
    <ul class="menu ml-20px">
      <li v-for="(item, $index) in list" :key="$index">
        <NuxtLink :to="item.src" :class="{ active: item.id == route?.name }">
          {{ item.name }}
        </NuxtLink>
      </li>
    </ul>
    <div class="flex-1" />
    <a
      class="bg-[var(--d-222-l-F2F2F2)] rounded-4px p-8px ml-8px h-32px w-320px flex no-underline"
      href=""
      @click.stop.prevent="dialogVisible_search = !dialogVisible_search"
    >
      <Icon
        class="text-20px text-[var(--d-666-l-999)]"
        name="material-symbols:search-rounded"
      />
      <span class="text-12px font-500 ml-4px text-[var(--d-666-l-999)]">
        Search Token Name/Contract
      </span>
    </a>
    <div class="flex-1" />
    <el-button
      v-if="!botStore.evmAddress"
      class="ml-10px bg-[var(--d-222-l-F2F2F2)] rounded-4px text-[var(--d-F5F5F5-l-333)]"
      @click="openConnect"
    >
      {{ $t('connectWallet') }}
    </el-button>
    <el-popover v-else placement="bottom" trigger="click">
      <template #reference>
        <el-button class="ml-10px">{{
          botStore.userInfo?.name || ''
        }}</el-button>
      </template>
      <div class="text-center clickable" @click.stop="botStore.logout">
        退出登录
      </div>
    </el-popover>
    <a
      class="bg-[var(--d-222-l-F2F2F2)] rounded-4px p-8px ml-8px h-32px flex items-center"
      href=""
    >
      <Icon
        class="text-20px text-[--d-999-l-666]"
        name="material-symbols:notifications"
      />
    </a>
    <el-dropdown
      trigger="click"
      placement="bottom"
      popper-class="dropdown-lang"
      @command="langStore.setLanguage"
    >
      <a
        class="bg-[var(--d-222-l-F2F2F2)] rounded-4px p-8px ml-8px h-32px flex items-center"
        href=""
        popper-class="dropdown-lang"
        @click.stop.prevent
      >
        <Icon
          class="text-20px text-[--d-999-l-666]"
          name="material-symbols:language"
        />
      </a>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(item, $index) in locales"
            :key="$index"
            :command="item?.code"
            :class="{ active: langStore.locale == item.code }"
          >
            {{ item?.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <a
      class="bg-[var(--d-222-l-F2F2F2)] rounded-4px p-8px ml-8px h-32px flex items-center"
      href=""
      @click.stop.prevent="themeStore.toggleTheme()"
    >
      <Icon
        class="text-20px text-[--d-999-l-666]"
        :name="themeStore.isDark ? 'custom:dark' : 'custom:light'"
      />
    </a>
    <dialog-search v-model="dialogVisible_search" />
    <connect-wallet v-model="botStore.connectVisible" />
  </header>
</template>
<script lang="ts" setup>
import dialogSearch from '@/components/header/dialogSearch.vue'
import connectWallet from '@/components/header/connectWallet/index.vue'
// const connectWallet = defineAsyncComponent(() => import('~/components/header/connectWallet/index.vue'))
const { locales } = useI18n()
const themeStore = useThemeStore()
const botStore = useBotStore()
const route = useRoute()
const langStore = useLocaleStore()
const list = shallowRef([
  { id: 'index', name: 'Market', src: '/' },
  { id: 'pump', name: 'PUMP', src: '/' },
  { id: 'follow', name: 'Follow', src: '/' },
  { id: 'smart', name: 'Smart', src: '/' },
  { id: 'assets', name: 'Assets', src: '/' },
])
const dialogVisible_search = shallowRef(false)

const openConnect = () => {
  botStore.changeConnectVisible(true)
}
</script>
<style lang="scss" scoped>
header {
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
