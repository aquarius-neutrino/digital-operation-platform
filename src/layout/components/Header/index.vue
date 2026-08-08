<template>
  <div class="layout-header flex justify-between items-center px-4 h-[50px] bg-white shadow-sm">
    <div class="flex items-center">
      <el-icon @click="toggleCollapse" class="cursor-pointer text-xl mr-3">
        <Fold v-if="!userStore.isCollapse" />
        <Expand v-else />
      </el-icon>
    </div>
    <el-dropdown @command="handleCommand">
      <span class="flex items-center cursor-pointer">
        <el-avatar :size="32">{{ userStore.userInfo.nickname || 'A' }}</el-avatar>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

const toggleCollapse = () => {
  userStore.isCollapse = !userStore.isCollapse
}

const handleCommand = (cmd: string) => {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-header {
  border-bottom: 1px solid #e5e7eb;
}
</style>