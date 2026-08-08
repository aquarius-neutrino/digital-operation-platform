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
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
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
  } else {
    next()
  }
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