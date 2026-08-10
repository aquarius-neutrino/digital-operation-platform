<template>
  <div class="error-page flex flex-col items-center justify-center h-full">
    <h1 class="text-8xl text-gray-300 font-bold">403</h1>
    <p class="text-xl text-gray-500 mt-4">抱歉，您暂无访问该页面的权限</p>
    <el-button type="primary" class="mt-6" @click="$router.push('/dashboard')">返回工作台</el-button>
  </div>
</template>

<style scoped>
.error-page {
  height: calc(100vh - 120px);
}
</style>