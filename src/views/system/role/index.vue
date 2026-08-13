<template>
  <div class="role-container">
    <!-- 搜索区域 -->
    <el-card shadow="hover">
      <el-form :model="queryForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-card header="大文件分片上传">
            <ChunkUpload />
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" v-permission="'system:role:add'" @click="openDialog()">新增角色</el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="roleName" label="角色名称" />
        
        <el-table-column prop="roleKey" label="角色标识" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <!--system:role:edit是js表达式，要用[]圈住，不然不生效-->
            <el-button size="small" type="primary" v-permission="['system:role:edit']" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="success" v-permission="['system:role:assign']" @click="openAssignDialog(row)">分配权限</el-button>
            <el-button size="small" type="danger" v-permission="['system:role:delete']" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="mt-4 justify-end"
        v-model:current-page="page.pageNum"
        v-model:page-size="page.pageSize"
        :total="page.total"
        :page-sizes="[10,20,50]"
        @change="getRoleList"
      />
    </el-card>

    <!-- 新增编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="角色" width="520px">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="例:system:admin" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog v-model="assignVisible" title="分配权限" width="540px">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedKeys"
      />
      <template #footer>
        <el-button @click="assignVisible=false">取消</el-button>
        <el-button type="primary" @click="submitAssign">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getRolePage, addRole, updateRole, delRole, assignPerm } from '@/api/system/role'
import { formatDate } from '@/utils/common'
import ChunkUpload from '@/components/ChunkUpload/index.vue'
const formRef = ref<FormInstance>()
const treeRef = ref<InstanceType<typeof ElTree>>()
const dialogVisible = ref(false)
const assignVisible = ref(false)
const isEdit = ref(false)
const tableData = ref<any[]>([])
const checkedKeys = ref<string[]>([])
const permissionTree = ref<any[]>([])

const queryForm = reactive({
  roleName: '',
  status: undefined
})

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: undefined,
  roleName: '',
  roleKey: '',
  sort: 0,
  status: 1,
  remark: ''
})

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

// 获取角色列表
async function getRoleList() {
  const res = await getRolePage({ ...queryForm, ...page })
  tableData.value = res.data.records
  page.total = res.data.total
}

// 打开新增/编辑弹窗
function openDialog(row?: any) {
  formRef.value?.resetFields()
  if(row) {
    isEdit.value = true
    Object.assign(form, row)
  } else {
    isEdit.value = false
    form.id = undefined
    form.roleName = ''
    form.roleKey = ''
    form.sort = 0
    form.status = 1
    form.remark = ''
  }
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  await formRef.value?.validate()
  if(isEdit.value) {
    await updateRole(form)
  } else {
    await addRole(form)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  getRoleList()
}

// 删除
async function handleDelete(row: any) {
  await ElMessageBox.confirm('确认删除该角色？', '提示', { type: 'warning' })
  await delRole(row.id)
  ElMessage.success('删除成功')
  getRoleList()
}

// 状态切换
async function handleStatusChange(row: any) {
  await updateRole(row)
  ElMessage.success('状态修改成功')
}

// 打开分配权限弹窗
function openAssignDialog(row: any) {
  form.id = row.id
  // mock模拟回显权限id
  checkedKeys.value = ['1', '2', '3']
  permissionTree.value = [
    { id:1, label:'系统管理', children:[
      {id:2, label:'用户管理'},
      {id:3, label:'角色管理'}
    ]}
  ]
  assignVisible.value = true
}

// 提交权限分配
async function submitAssign() {
  const keys = treeRef.value?.getCheckedKeys() || []
  await assignPerm({ roleId: form.id, permIds: keys })
  ElMessage.success('权限分配成功')
  assignVisible.value = false
}

// 重置搜索
function resetQuery() {
  queryForm.roleName = ''
  queryForm.status = undefined
  page.pageNum = 1
  getRoleList()
}

getRoleList()
</script>

<style scoped>
.role-container {
  padding:16px;
}
.card-header {
  display:flex;
  justify-content: space-between;
  align-items:center;
}
</style>