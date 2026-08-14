import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { cancelAllRequest } from '@/utils/request'
import { removeWatermark } from '@/utils/watermark'
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<any>({})
  const permissions = ref<string[]>([])
  // 标记动态路由是否已经添加，防止重复addRoute
  const hasRoutes = ref(false)
  // 过滤之后的动态路由（侧边栏菜单渲染使用）
  const accessRoutes = ref<RouteRecordRaw[]>([])
  const isCollapse = ref(false) // 菜单折叠状态
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }
  // 在 defineStore 里面追加
  const visitedViews = ref<any[]>([])
  // 保存登录信息
  const setLoginData = (tk: string, info: any, perm: string[]) => {
    token.value = tk
    userInfo.value = info
    permissions.value = perm
    hasRoutes.value = false // 登录重置路由标记
    accessRoutes.value = []
  }

  // 存储筛选后的动态路由
  const setAccessRoutes = (routes: RouteRecordRaw[]) => {
    accessRoutes.value = routes
  }
  // 添加访问标签
  const addVisitedView = (view: any) => {
    if (visitedViews.value.some(v => v.path === view.path)) return
    visitedViews.value.push({ ...view })
  }
  // 删除标签
  const delVisitedView = (view: any) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  // 退出登录
  const logout = () => {
    // 终止所有网络请求
    cancelAllRequest()
    // 销毁水印
    removeWatermark()
    token.value = ''
    userInfo.value = {}
    permissions.value = []
    hasRoutes.value = false
    accessRoutes.value = []
    visitedViews.value = []
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    permissions,
    hasRoutes,
    accessRoutes,
    setLoginData,
    setAccessRoutes,
    logout,
    isCollapse,
    toggleCollapse,
    visitedViews,
    addVisitedView,
    delVisitedView
  }
}, {
  persist:{
    pick: ['token','userInfo','permissions'] // 只持久化这3个！！排除 hasRoutes、accessRoutes
  } // pinia持久化，记得安装 pinia-plugin-persistedstate
})