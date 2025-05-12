// stores/theme.ts
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const theme = useLocalStorage<'light' | 'dark'>('app-theme', 'dark')

  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    updateDomClass()
  }

  const setTheme = (val: 'light' | 'dark') => {
    theme.value = val
    updateDomClass()
  }

  const updateDomClass = () => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
    document.documentElement.classList.toggle('light', theme.value === 'light')
  }

  // 初始化时调用
  updateDomClass()

  return { theme, isDark, toggleTheme, setTheme }
})
