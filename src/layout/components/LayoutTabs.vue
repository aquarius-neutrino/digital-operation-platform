<template>
  <div class="tabs-container flex items-center px-2 border-b h-[40px] bg-white dark:bg-gray-800">
    <el-scrollbar scrollbar-width="thin">
      <div class="flex gap-1">
        <el-tag
          v-for="item in visitedViews"
          :key="item.path"
          :closable="item.path !== '/dashboard'"
          :type="route.path === item.path ? 'primary' : ''"
          effect="light"
          @close="closeView(item)"
          @click="$router.push(item.path)"
        >
          {{ item.meta.title }}
        </el-tag>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()
const visitedViews = ref<RouteLocationNormalized[]>([])

// 监听路由变化【重点修复：每次路由跳转都会执行】
watch(
  () => route.path,
  (newPath) => {
    // 排除无标题页面，不创建标签
    if (!route.meta.title) return

    const hasExist = visitedViews.value.some(v => v.path === newPath)
    if (!hasExist) {
      visitedViews.value.push({ ...route })
    }
  },
  { immediate: true }
)

// 关闭标签页
const closeView = (view: RouteLocationNormalized) => {
  const index = visitedViews.value.findIndex(v => v.path === view.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
  }

  // 如果关闭的是当前激活页面，自动跳转最近剩下标签
  if (route.path === view.path) {
    const latestView = visitedViews.value.at(-1)
    if (latestView) {
      router.push(latestView.path)
    } else {
      router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.tabs-container {
  width: 100%;
}
</style>