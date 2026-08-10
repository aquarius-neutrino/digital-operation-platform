import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { asyncRoutes } from './asyncRoutes'
import { filterAsyncRoutes } from './permissionFilter'
import Layout from '@/layout/index.vue' // 按你项目真实路径
// 静态路由（无需权限：登录、首页、404）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    // 新增hidden属性，表示该路由不在侧边栏显示
    meta: { title: '登录',hidden:true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'House' }
      },
      // 新增个人中心路由
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: false }
      },
       {
        path: '/403',
        name: 'Page403',
        component: () => import('@/views/error/403.vue'),
        meta: { title: '无权限', hidden: true }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const token = userStore.token

  // 1. 没有token
  if (!token) {
    to.path === '/login' ? next() : next('/login')
    return
  }

  // 2. 有token，访问登录页，直接跳工作台
  if (to.path === '/login') {
    next('/dashboard')
    return
  }
    // 根据路径递归查找原始路由元信息
  function findRouteMeta(routes: RouteRecordRaw[], path: string): any {
    for (const route of routes) {
      if (route.path === path) return route.meta
      if (route.children) {
        const childMeta = findRouteMeta(route.children, path)
        if (childMeta) return childMeta
        // 处理嵌套子路由拼接路径
        for (const child of route.children) {
          const fullPath = `${route.path}/${child.path}`
          if (fullPath === path) return child.meta
        }
      }
    }
    return null
  }
  // 3. 动态路由还未加载
  if (!userStore.hasRoutes) {
    // 根据权限过滤路由
    const accessRoutes = filterAsyncRoutes(asyncRoutes, userStore.permissions)
    // 批量注册动态路由
    accessRoutes.forEach(route => {
        router.addRoute(route)
    })
    userStore.setAccessRoutes(accessRoutes)
    userStore.hasRoutes = true
    // ⭐重点：replace:true 防止无限重定向，重新进入一次路由匹配最新路由表
    next({ ...to, replace: true })
  }  
    // 核心修改：从原始全部异步路由匹配当前访问路径的权限标识
      const routeMeta = findRouteMeta(asyncRoutes, to.path)
      const targetPerms: string[] = routeMeta?.permission || []
      const userPerms: string[] = userStore.userInfo.permissions || []
      if (targetPerms.length && !targetPerms.some(p => userPerms.includes(p))) {
        return next('/403')
      }

      next()
    })

router.afterEach((to) => {
  NProgress.done()
  const userStore = useUserStore()
  if(to.meta.title && !to.meta.hidden){ 
    userStore.addVisitedView(to)
  }
})

export default router
export {  asyncRoutes }