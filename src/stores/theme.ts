// stores/theme.ts
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const theme = useLocalStorage<'light' | 'dark'>('app-theme', 'dark')

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
  }

  // 初始化时调用
  updateDomClass()

  return { theme, toggleTheme, setTheme }
})
