<template>
  <div class="tag-view flex gap-1 p-2 border-b">
    <el-tag
      v-for="tag in visitedViews"
      :key="tag.path"
      closable
      :disable-close="tag.path === '/dashboard'"
      @close="closeTag(tag)"
      @click="$router.push(tag.path)"
      class="cursor-pointer"
      :type="$route.path === tag.path ? 'primary' : ''"
    >
      {{ tag.meta.title }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const visitedViews = computed(() => {
  return userStore.visitedViews
})

const closeTag = (tag: any) => {
  userStore.delVisitedView(tag)
  // 关闭标签同步删除页面缓存
  appStore.delCachedView(tag.name)
  if (route.path === tag.path) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.tag-view {
  min-height: 40px;
}
</style>