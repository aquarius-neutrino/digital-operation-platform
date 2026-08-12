import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state:()=>({
    isDark: false,
    islogout: false,
     // 需要缓存的页面name
    cachedViews: [] as string[]
  }),
  actions:{
    toggleDark(){ 
      if(this.islogout) {
        this.isDark = false
      }else{
        this.isDark = !this.isDark
      }
      const html = document.documentElement
      html.classList.toggle('dark', this.isDark)
    },
    // 添加缓存页面
    addCachedView(name: string) {
      if (!this.cachedViews.includes(name)) this.cachedViews.push(name)
    },
    // 删除单个缓存
    delCachedView(name: string) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) this.cachedViews.splice(index, 1)
    },
    // 清空全部缓存
    clearAllCache() {
      this.cachedViews = []
    }
  },
  persist:true
})