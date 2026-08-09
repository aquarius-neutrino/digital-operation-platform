import request from '@/utils/request'

// 修改个人基础资料
export function updateProfile(data: any) {
  return request({
    url: '/profile/update',
    method: 'put',
    data
  })
}

// 修改密码
export function updatePassword(data: any) {
  return request({
    url: '/profile/password',
    method: 'put',
    data
  })
}