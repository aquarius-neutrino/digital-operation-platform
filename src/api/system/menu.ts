import request from '@/utils/request'

// 获取菜单树形列表
export function getMenuTree() {
  return request({ url: '/menu/tree', method: 'get' })
}

// 新增菜单
export function addMenu(data: any) {
  return request({ url: '/menu', method: 'post', data })
}

// 编辑菜单
export function updateMenu(data: any) {
  return request({ url: '/menu', method: 'put', data })
}

// 删除菜单
export function delMenu(id: number) {
  return request({ url: `/menu/${id}`, method: 'delete' })
}

// 修改菜单状态
export function changeMenuStatus(data: any) {
  return request({ url: '/menu/status', method: 'patch', data })
}