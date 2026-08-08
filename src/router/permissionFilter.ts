// 重点：递归处理子路由，解决之前子路由丢失空白页面问题
import type { RouteRecordRaw } from 'vue-router'

/**
 * 递归过滤异步路由，保留拥有权限的路由
 * @param routes 原始异步路由
 * @param permissions 当前用户权限数组
 * @returns 过滤后可访问路由
 */
export function filterAsyncRoutes(routes: RouteRecordRaw[], permissions?: string[]) {
  // ✅ 兜底：如果传进来是 undefined，直接赋值空数组
  const realPerms = permissions ?? []
  const res: RouteRecordRaw[] = []
  routes.forEach(route => {
    // 判断当前路由是否有权限
    const routePermission = route.meta?.permission as string[] || []
    const hasAccess = routePermission.some(item => realPerms.includes(item))

    if (hasAccess) {
      const tempRoute = { ...route }
      // 递归处理子路由（核心！！缺少会丢失children）
      if (tempRoute.children && tempRoute.children.length) {
        tempRoute.children = filterAsyncRoutes(tempRoute.children, permissions)
      }
      res.push(tempRoute)
    }
  })
  return res
}
