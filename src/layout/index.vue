<template>
  <div class="layout-container flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapse: userStore.isCollapse }">
      <Sidebar />
    </div>

    <div class="main-wrapper flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航 -->
      <Header />
      <!-- 标签页 -->
      <TagView />
      <!-- 主内容区域 -->
      <main class="flex-1 overflow-auto p-4 bg-gray-50 bg-white dark:bg-gray-800">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setWatermark, removeWatermark } from '@/utils/watermark'
import { useUserStore } from '@/store/user'
import Sidebar from './components/Sidebar/index.vue'
import Header from './components/Header/index.vue'
import TagView from './components/TagView/index.vue'
import { useAppStore } from '@/store/app'
const appStore = useAppStore()
const userStore = useUserStore()
// ✅ 刷新/进入页面立刻同步html的class
const html = document.documentElement
html.classList.toggle('dark', appStore.isDark)
// 登录后渲染水印，水印内容为当前登录用户名
setWatermark(`内部文档 ${userStore.userInfo.username || 'admin'}`)

</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.sidebar {
  width: 220px;
  transition: width 0.3s;
  background-color: #304156;
}
.sidebar.collapse {
  width: 64px;
}
.main-wrapper {
  display: flex;
  flex-direction: column;
}
</style>