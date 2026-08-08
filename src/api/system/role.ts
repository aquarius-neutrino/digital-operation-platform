import request from '@/utils/request'

export function getRolePage(params:any) {
  return request({ url:'/role/page', method:'get', params })
}

export function addRole(data:any) {
  return request({ url:'/role', method:'post', data })
}

export function updateRole(data:any) {
  return request({ url:'/role', method:'put', data })
}

export function delRole(id:number) {
  return request({ url:`/role/${id}`, method:'delete' })
}

export function assignPerm(data:any) {
  return request({ url:'/role/assignPerm', method:'post', data })
}