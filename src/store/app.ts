// Pinia 状态仓库 src/store，侧边栏，主题
import { defineStore } from 'pinia'
import { getStorage, setStorage } from '@/utils/storage'

interface AppState {
  sidebarCollapse: boolean
  darkMode: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapse: getStorage<boolean>('SIDEBAR_COLLAPSE') ?? false,
    darkMode: getStorage<boolean>('DARK_MODE') ?? false
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
      setStorage('SIDEBAR_COLLAPSE', this.sidebarCollapse)
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      setStorage('DARK_MODE', this.darkMode)
      // html挂载暗黑类名
      document.documentElement.classList.toggle('dark', this.darkMode)
    }
  }
})