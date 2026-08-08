<!-- 创建工作台首页 -->
<template>
  <el-card shadow="hover">
    <h2>欢迎进入企业数字化运营管理平台</h2>
    <p>当前登录用户：{{ userStore.userInfo.username }}</p>
    <p class="mt-2 text-gray-500">接下来开发 RBAC 动态路由 + 按钮权限指令 v-permission</p>
  </el-card>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
</script>