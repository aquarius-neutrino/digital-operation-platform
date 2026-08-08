import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state:()=>({
    isDark: false,
    islogout: false
  }),
  actions:{
    toggleDark(){ 
      if(this.islogout) {
        this.isDark = false
      }else{
        this.isDark = !this.isDark
      }
      const html = document.documentElement
      // if(this.isDark) html.classList.add('dark')
      // else html.classList.remove('dark')
      html.classList.toggle('dark', this.isDark)
    }
  },
  persist:true
})