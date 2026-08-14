<template>
  <div class="user-page p-4">
    <!--搜索区域-->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" @input="handleSearch" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getUserList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="genBigData">生成10000条测试数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!--操作按钮-->
    <el-card>
    <!-- 虚拟表格 -->
    <VirtualTable
      :source-list="bigTableData"
      table-height="280px"
      :row-height="54"
      :show-pagination="true"
      :page-info="pageInfo"
      @page-change="refreshTable"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status ===1 ? 'success' : 'danger'">
            {{ row.status ===1 ? '启用':'禁用' }}
          </el-tag>
        </template>
      </el-table-column>
        <el-table-column label="创建时间" >
          <div>{{ $utils.formatDate(new Date()) }}</div>
        </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
            <el-button link type="primary" v-permission="['system:user:edit']" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" v-permission="['system:user:delete']" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </VirtualTable>
    </el-card>
   
    <!--新增编辑弹窗-->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCurrentInstance } from 'vue'
import { debounce } from '@/utils/common'
import { throttle } from '@/utils/common'
import { storage } from '@/utils/common'
const { proxy } = getCurrentInstance()!
import { formatDate } from '@/utils/common'
import { useCancelRequest } from '@/hooks/useCancelRequest'
// 页面销毁自动取消所有请求
useCancelRequest()
const $utils = proxy.$utils
// 搜索表单
const searchForm = reactive({
  username: '',
  status: undefined as number | undefined
})
const bigTableData = ref<any[]>([])
const loadingTip = ref('')
const pageInfo = reactive({
  pageNum: 1,
  pageSize: 100,
  total: 0
})

const genBigData = async () => {
  console.log('按钮点击，开始生成数据')
  loadingTip.value = '正在生成数据...'
  const list: any[] = []
  const batch = 500 // 每批500条，让出主线程
  let i = 1

  while (i <= 10000) {
    const end = Math.min(i + batch - 1, 10000)
    for (; i <= end; i++) {
      list.push({
        id: i,
        username: `user_${i}`,
        nickname: `用户${i}`,
        phone: `138${String(i).padStart(8, '0')}`,
        status: i % 5 === 0 ? 0 : 1,
        createTime: formatDate(Date.now() - i * 3600 * 1000)
      })
    }
    // 让出浏览器渲染队列
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  bigTableData.value = list
  pageInfo.total = list.length
  loadingTip.value = `生成完成，共${list.length}条数据`
  console.log('数据生成完毕，条数：', list.length)
}

// 分页刷新
const refreshTable = (page: any) => {
  console.log('分页变更', page)
  // 真实项目此处请求接口分页数据赋值给 bigTableData
}

// 防抖300ms，停止输入后再请求接口
const handleSearch = debounce(() => {
  console.log('发起搜索请求：', searchForm.username)
  // getUserList()
}, 1000)
// 节流500ms，500ms内只执行一次
const handleResize = throttle(() => {
  console.log('窗口尺寸变化')
}, 500)

window.addEventListener('resize', handleResize)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: 0,
  username: '',
  nickname: '',
  phone: '',
  status:1
})

// 获取用户列表（mock接口）
const getUserList = async () => {
  // mock模拟请求，真实项目替换为request请求
  const mockRes = {
    code:200,
    data:{
      records:[
        {id:1, username:'admin', nickname:'超级管理员', phone:'13800138000', status:1, createTime:'2026-08-01 10:00:00'},
        {id:2, username:'test01', nickname:'测试账号', phone:'13800138111', status:0, createTime:'2026-08-02 11:20:00'}
      ],
      total:2
    }
  }
  tableData.value = mockRes.data.records
  pageInfo.total = mockRes.data.total
}

//重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.status = undefined
  pageInfo.pageNum =1
  getUserList()
}

//打开弹窗
const openDialog = (row?:any) => {
  dialogVisible.value = true
  if(row){
    isEdit.value = true
    Object.assign(form, row)
  }else{
    isEdit.value = false
    form.id =0
    form.username=''
    form.nickname=''
    form.phone=''
    form.status=1
  }
}

//提交表单
const submitForm = () => {
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
  dialogVisible.value = false
  getUserList()
}

//删除
const handleDelete = (row:any) => {
  ElMessageBox.confirm('确认删除该用户?','提示',{type:'warning'}).then(()=>{
    ElMessage.success('删除成功')
    getUserList()
  })
}
//本地存储存储封装
// 存
// storage.set('testKey', { name: 'admin' })
// // 取
// const data = storage.get<{ name: string }>('testKey')
// // 删除
// storage.remove('testKey')
// // 清空全部
// storage.clear()
// //页面加载拿数据
// getUserList()
</script>