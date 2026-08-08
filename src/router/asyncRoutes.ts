import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      permission: ['system:user:list'] // 父菜单权限标识
    },
    children: [
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          permission: ['system:user:list']
        }
      },
      {
        path: 'role',
        name: 'RoleManage',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          permission: ['system:role:list']
        }
      },
      {
        path: 'menu',
        name: 'MenuManage',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          permission: ['system:menu:list']
        }
      }
    ]
  },
]