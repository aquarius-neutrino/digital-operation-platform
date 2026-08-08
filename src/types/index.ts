// 统一管理ts类型，大型项目建议使用这种方式管理ts类型，避免类型分散在各个文件中，造成维护困难
// 用户信息类型
export interface UserInfo {
  name: string
  avatar: string
  roles: string[]
}

// 接口基础返回格式
export interface ResponseData<T = any> {
  code: number
  data: T
  msg: string
}

// 路由项
export interface RouteItem {
  path: string
  name: string
  component?: string
  meta: {
    title: string
    icon?: string
    permission?: string[]
    cache?: boolean
  }
  children?: RouteItem[]
}

// 菜单
export interface MenuItem extends RouteItem {}