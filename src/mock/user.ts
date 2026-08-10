import { MockMethod } from 'vite-plugin-mock'

export default [
  // 登录接口
  {
    url: '/api/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          msg: '登录成功',
          data: {
            token: 'admin-token-20260804',
            userInfo: {
              id: 1,
              username: 'admin',
              nickname: '超级管理员',
              roles: ['admin'],
              // 权限标识 用于 v-permission
              permissions: 
                [
                  'system',
                  'system:user:list', 
                  'system:user:add', 
                  'system:user:edit', 
                  'system:user:delete', 
                  'system:role:list',
                  'system:role:delete',
                  'system:role:add',
                  'system:role:edit',
                  'system:menu:list',
                  'system:menu:delete',
                  'system:menu:edit',
                  'system:menu:add'
                ]
            }
          }
        }
      } else {
        return { code: 401, msg: '账号密码错误' }
      }
    }
  },
  // ✅ 新增：获取用户权限信息接口
  {
    url: '/api/getUserInfo',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          permissions: ['system:user:list', 'system:user:add', 'system:user:edit', 'system:user:delete', 'system:role:list','system:menu:list'],
          roles: ['admin']
        }
      }
    }
  }
] as MockMethod[]