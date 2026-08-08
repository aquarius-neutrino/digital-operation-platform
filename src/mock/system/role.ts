import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url:'/api/role/page',
    method:'get',
    response:({})=>{
      return {
        code:200,
        data:{
          total:2,
          records:[
            { id:1, roleName:'超级管理员', roleKey:'admin', sort:1, status:1, remark:'拥有全部权限', createTime:'2026‑08‑01 10:00:00' },
            { id:2, roleName:'普通操作员', roleKey:'operator', sort:2, status:1, remark:'基础操作权限', createTime:'2026‑08‑02 11:20:00' }
          ]
        }
      }
    }
  },
  { url:'/api/role', method:'post', response:()=>({code:200,msg:'新增成功'}) },
  { url:'/api/role', method:'put', response:()=>({code:200,msg:'修改成功'}) },
  { url:'/api/role/:id', method:'delete', response:()=>({code:200,msg:'删除成功'}) },
  { url:'/api/role/assignPerm', method:'post', response:()=>({code:200,msg:'分配成功'}) }
] as MockMethod[]