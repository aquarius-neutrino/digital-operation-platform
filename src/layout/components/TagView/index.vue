<template>
  <div class="tag-view flex gap-1 p-2 bg-white border-b">
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

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const visitedViews = computed(() => {
  return userStore.visitedViews
})

const closeTag = (tag: any) => {
  userStore.delVisitedView(tag)
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