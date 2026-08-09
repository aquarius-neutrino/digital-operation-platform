import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/profile/update',
    method: 'put',
    response: () => {
      return { code: 200, msg: '资料修改成功' }
    }
  },
  {
    url: '/api/profile/password',
    method: 'put',
    response: () => {
      return { code: 200, msg: '密码修改成功' }
    }
  }
] as MockMethod[]