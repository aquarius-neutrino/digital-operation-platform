<template>
  <div class="menu-page p-4">
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium">菜单列表</span>
          <el-button type="primary" v-permission="'system:menu:add'" @click="openDialog()">新增菜单</el-button>
        </div>
      </template>

      <!-- 树形表格 -->
      <el-table
        :data="tableData"
        row-key="id"
        border
        stripe
      >
        <el-table-column label="菜单名称" prop="menuName" />
        <el-table-column label="路由地址" prop="path" />
        <el-table-column label="组件路径" prop="component" />
        <el-table-column label="权限标识" prop="permission" />
        <el-table-column label="图标" prop="icon" />
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.type === 0" type="primary">目录</el-tag>
            <el-tag v-if="row.type === 1" type="success">菜单</el-tag>
            <el-tag v-if="row.type === 2" type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="changeStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" type="primary" v-permission="['system:menu:edit']" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="success" v-permission="['system:menu:add']" @click="addChild(row)">新增子菜单</el-button>
            <el-button size="small" type="danger" v-permission="['system:menu:delete']" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="620px">
      <el-form ref="formRef" :model="form" label-width="100px" :rules="rules">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeOptions"
            placeholder="顶级菜单不选"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="例：/system/user" />
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="例:views/system/user/index.vue" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="form.permission" placeholder="例:system:user:list" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="图标">
          <el-input v-model="form.icon" placeholder="ElementPlus图标名" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { getMenuTree, addMenu, updateMenu, delMenu, changeMenuStatus } from '@/api/system/menu'

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref<any[]>([])
const treeOptions = ref<any[]>([])

const form = reactive({
  id: undefined,
  parentId: undefined,
  type: 1,
  menuName: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules = {
  menuName: [{ required: true, message: '请填写菜单名称', trigger: 'blur' }],
  permission: [{ required: true, message: '请填写权限标识', trigger: 'blur' }]
}

// 获取树形菜单列表
async function getMenuList() {
  const res = await getMenuTree()
  tableData.value = res.data
  treeOptions.value = res.data
}

// 打开弹窗
function openDialog(row?: any) {
  formRef.value?.resetFields()
  isEdit.value = !!row
  if (row) {
    Object.assign(form, row)
    form.parentId = row.parentId || undefined
  } else {
    form.id = undefined
    form.parentId = undefined
    form.type = 1
    form.menuName = ''
    form.path = ''
    form.component = ''
    form.permission = ''
    form.icon = ''
    form.sort = 0
    form.status = 1
  }
  dialogVisible.value = true
}

// 新增子菜单
function addChild(row: any) {
  formRef.value?.resetFields()
  isEdit.value = false
  form.id = undefined
  form.parentId = row.id
  form.type = 1
  form.menuName = ''
  form.path = ''
  form.component = ''
  form.permission = ''
  form.icon = ''
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  await formRef.value?.validate()
  if (isEdit.value) {
    await updateMenu(form)
  } else {
    await addMenu(form)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  getMenuList()
}

// 删除菜单
async function handleDelete(row: any) {
  await ElMessageBox.confirm('删除后子菜单同步删除，确认操作？', '警告', { type: 'warning' })
  await delMenu(row.id)
  ElMessage.success('删除成功')
  getMenuList()
}

// 切换状态
async function changeStatus(row: any) {
  await changeMenuStatus({ id: row.id, status: row.status })
  ElMessage.success('状态更新成功')
}

onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.menu-page {
  min-height: calc(100vh - 80px);
}
</style>