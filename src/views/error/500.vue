<template>
  <div class="error-page flex flex-col items-center justify-center h-full">
    <h1 class="text-8xl text-gray-300 font-bold">500</h1>
    <p class="text-xl text-gray-500 mt-4">服务器内部错误，请稍后重试</p>
    <div class="flex gap-4 mt-6">
      <el-button @click="$router.back()">返回上一页</el-button>
      <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  height: calc(100vh - 120px);
}
</style>