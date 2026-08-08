import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/menu/tree',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: 1,
            parentId: null,
            type: 0,
            menuName: '系统管理',
            path: '/system',
            component: 'Layout',
            icon: 'Setting',
            permission: 'system',
            sort: 1,
            status: 1,
            children: [
              {
                id: 101,
                parentId: 1,
                type: 1,
                menuName: '用户管理',
                path: 'user',
                component: 'views/system/user/index.vue',
                icon: 'User',
                permission: 'system:user:list',
                sort: 1,
                status: 1,
                children: [
                  { id: 1011, parentId: 101, type: 2, menuName: '新增用户', permission: 'system:user:add', status: 1 },
                  { id: 1012, parentId: 101, type: 2, menuName: '编辑用户', permission: 'system:user:edit', status: 1 },
                  { id: 1013, parentId: 101, type: 2, menuName: '删除用户', permission: 'system:user:delete', status: 1 }
                ]
              },
              {
                id: 102,
                parentId: 1,
                type: 1,
                menuName: '角色管理',
                path: 'role',
                component: 'views/system/role/index.vue',
                icon: 'UserFilled',
                permission: 'system:role:list',
                sort: 2,
                status: 1,
                children: [
                  { id: 1021, parentId: 102, type: 2, menuName: '新增角色', permission: 'system:role:add', status: 1 },
                  { id: 1022, parentId: 102, type: 2, menuName: '编辑角色', permission: 'system:role:edit', status: 1 },
                  { id: 1023, parentId: 102, type: 2, menuName: '分配权限', permission: 'system:role:assign', status: 1 },
                  { id: 1024, parentId: 102, type: 2, menuName: '删除角色', permission: 'system:role:delete', status: 1 }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  { url: '/api/menu', method: 'post', response: () => ({ code: 200, msg: '新增菜单成功' }) },
  { url: '/api/menu', method: 'put', response: () => ({ code: 200, msg: '编辑菜单成功' }) },
  { url: '/api/menu/:id', method: 'delete', response: () => ({ code: 200, msg: '删除菜单成功' }) },
  { url: '/api/menu/status', method: 'patch', response: () => ({ code: 200, msg: '状态修改成功' }) }
] as MockMethod[]