<template>
  <div class="layout-container flex h-screen overflow-hidden">
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
      <main class="flex-1 overflow-auto p-4 bg-gray-50">
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
import { useUserStore } from '@/store/user'
import Sidebar from './components/Sidebar/index.vue'
import Header from './components/Header/index.vue'
import TagView from './components/TagView/index.vue'

const userStore = useUserStore()
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