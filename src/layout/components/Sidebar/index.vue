<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      mode="vertical"
      router
    >
      <!-- 循环合并之后的完整菜单 -->
      <template v-for="item in menuList" :key="item.path">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
          <template #title>
            <el-icon>
              <component :is="item.meta?.icon" />
            </el-icon>
            <span>{{ item.meta?.title }}</span>
          </template>
          <el-menu-item
            v-for="subItem in item.children"
            :key="subItem.path"
            :index="resolvePath(subItem.path, item.path)"
          >
            <template #title>
              <span>{{ subItem.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有子菜单，一级菜单 -->
        <el-menu-item v-else :index="item.path">
          <template #title>
            <el-icon>
              <component :is="item.meta?.icon" />
            </el-icon>
            <span>{{ item.meta?.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { constantRoutes } from '@/router'

const route = useRoute()
const userStore = useUserStore()

// layout的收缩状态
const isCollapse = computed(() => userStore.isCollapse)

// ✅ 合并菜单：静态路由 + 权限过滤后的动态路由
const menuList = computed(() => {
  // 过滤静态路由，只输出需要展示在侧边栏的路由（过滤登录、404）
  const staticMenus = constantRoutes.filter(item => item.meta?.title&&!item.meta?.hidden)
  // 拼接动态权限路由
  return [...staticMenus, ...userStore.accessRoutes]
})

// 当前激活菜单
const activeMenu = computed(() => {
  return route.path
})

/**
 * 拼接子路由完整路径，el‑sub‑menu必须完整绝对路径
 * @param childPath 子path
 * @param parentPath 父path
 */
function resolvePath(childPath: string, parentPath: string) {
  if (childPath.startsWith('/')) return childPath
  return `${parentPath}/${childPath}`
}
</script>

<style scoped>
.scrollbar-wrapper {
  height: calc(100vh - 50px);
}
</style>