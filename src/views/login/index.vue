<template>
  <div class="login-wrap flex-center h-screen bg-slate-100">
    <el-card shadow="hover" class="w-[420px]">
      <h2 class="text-center text-xl font-bold mb-6">企业数字化运营管理平台</h2>
      <el-form ref="formRef" :model="form" label-width="70px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="text-gray-500 text-sm text-center">测试账号：admin / 123456</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import service from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const form = ref({
  username: 'admin',
  password: '123456'
})

const handleLogin = async () => {
  const res = await service.post('/login', form.value)
  if (res.code === 200) {
    const { token, userInfo} = res.data
    userStore.setLoginData(token, userInfo, userInfo.permissions)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  }
}
</script>