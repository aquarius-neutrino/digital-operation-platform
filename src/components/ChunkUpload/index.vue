<template>
  <div class="chunk-upload">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :show-file-list="false"
      accept=".mp4,.mov,.avi,.zip,.rar,.pdf"
      @change="handleFileChange"
    >
      <!-- 标准trigger插槽，修复文件选择事件丢失 -->
      <template #trigger>
        <el-button type="primary">
          <el-icon><Upload /></el-icon>选择大文件
        </el-button>
      </template>
    </el-upload>

    <!-- 加载提示：MD5计算中 -->
    <div v-if="calcMd5Loading" class="mt-3 text-blue-500">
      <el-icon class="is-loading"><Loading /></el-icon>正在计算文件唯一标识MD5，请稍候...
    </div>

    <!-- 文件信息与上传进度 -->
    <div v-if="fileInfo" class="file-item mt-4 border p-4 rounded">
      <div class="flex justify-between items-center">
        <div class="file-name">{{ fileInfo.name }}</div>
        <div class="flex gap-2">
          <el-button size="small" v-if="status === 'uploading'" @click="pauseUpload">暂停</el-button>
          <el-button size="small" v-if="status === 'pause'" @click="resumeUpload">继续上传</el-button>
          <el-button size="small" type="danger" @click="clearUpload">取消</el-button>
        </div>
      </div>
      <el-progress :percentage="progressPercent" class="mt-2" :status="progressStatus" />
      <div class="text-xs text-gray-500 mt-1">
        {{ statusText }}｜已上传 {{ finishedChunkIndex.length }} / {{ totalChunkCount }} 分片
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElUpload, ElMessage } from 'element-plus'
import { Upload, Loading } from '@element-plus/icons-vue'
import request  from '@/utils/request'
import SparkMD5 from 'spark-md5'

// 分片大小 5MB
const CHUNK_SIZE = 5 * 1024 * 1024
// MD5单次读取块大小 2MB，让出主线程
const MD5_BLOCK = 2 * 1024 * 1024

const uploadRef = ref<InstanceType<typeof ElUpload>>()
const fileList = ref<any[]>([])
// MD5计算加载状态
const calcMd5Loading = ref(false)
// 文件状态
type UploadStatus = 'wait' | 'uploading' | 'pause' | 'success' | 'error'
const status = ref<UploadStatus>('wait')
const fileInfo = ref<{ name: string; size: number; file: File } | null>(null)
const fileMd5 = ref('')
const totalChunkCount = ref(0)
// 已经上传完成分片下标集合（断点续传核心）
const finishedChunkIndex = ref<number[]>([])
let chunks: Blob[] = []
let abortControllerList: AbortController[] = []

// 进度计算
const progressPercent = computed(() => {
  if (!totalChunkCount.value) return 0
  return Math.floor((finishedChunkIndex.value.length / totalChunkCount.value) * 100)
})
const progressStatus = computed(() => {
  if (status.value === 'success') return 'success'
  if (status.value === 'error') return 'exception'
  return undefined
})
const statusText = computed(() => {
  const map: Record<UploadStatus, string> = {
    wait: '等待上传',
    uploading: '上传中...',
    pause: '已暂停',
    success: '✅上传完成，等待后端合并分片',
    error: '❌上传失败'
  }
  return map[status.value]
})

// 选择文件
const handleFileChange = async (fileObj: any) => {
  const rawFile = fileObj.raw as File
  console.log('已选中文件', rawFile.name)
  // 限制最大 200M
  const MAX_SIZE = 200 * 1024 * 1024
  if (rawFile.size > MAX_SIZE) {
    ElMessage.warning('文件不能超过200MB')
    resetAll()
    return
  }
  resetAll()
  fileInfo.value = { name: rawFile.name, size: rawFile.size, file: rawFile }
  // 异步计算MD5，不会阻塞页面
  await computeFileMD5(rawFile)
}

/**
 * 修复版：异步分片计算MD5，每次读取后让出主线程，页面不会卡死
 */
const computeFileMD5 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    calcMd5Loading.value = true
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    let current = 0
    const total = file.size

    const loadNext = () => {
      const end = Math.min(current + MD5_BLOCK, total)
      const blob = file.slice(current, end)
      reader.readAsArrayBuffer(blob)
    }

    reader.onload = async (e) => {
      spark.append(e.target?.result as ArrayBuffer)
      current += MD5_BLOCK
      // 让出浏览器渲染队列，防止主线程卡死
      await new Promise(r => setTimeout(r, 0))
      if (current < total) {
        loadNext()
      } else {
        calcMd5Loading.value = false
        const md5 = spark.end()
        fileMd5.value = md5
        splitFileChunk(file)
        resolve(md5)
      }
    }
    reader.onerror = () => {
      calcMd5Loading.value = false
      ElMessage.error('读取文件失败')
    }
    loadNext()
  })
}

// 文件切分（轻量操作，无阻塞）
const splitFileChunk = (file: File) => {
  chunks = []
  let start = 0
  const size = file.size
  while (start < size) {
    const end = Math.min(start + CHUNK_SIZE, size)
    chunks.push(file.slice(start, end))
    start = end
  }
  totalChunkCount.value = chunks.length
  // 请求后端查询已上传分片（断点续传关键点）
  checkUploadedChunks()
}

// 查询已上传哪些分片
const checkUploadedChunks = async () => {
  await new Promise(r => setTimeout(r, 800))
  try {
    const res = await request({
      url: '/upload/check',
      method: 'post',
      data: {
        md5: fileMd5.value,
        fileName: fileInfo.value!.name
      }
    })
    finishedChunkIndex.value = res.data?.uploadedChunkIndex || []
    status.value = 'uploading'
    await startUploadChunks()
  } catch (err) {
    ElMessage.error('获取已上传分片失败')
    status.value = 'error'
  }
}

// 并发上传分片（控制并发数3，防止请求打爆）
const startUploadChunks = async () => {
  const concurrency = 3
  const tasks: Promise<void>[] = []
  for (let i = 0; i < chunks.length; i++) {
    // 已经上传完成的分片直接跳过
    if (finishedChunkIndex.value.includes(i)) continue
    // 暂停状态跳出循环
    if (status.value === 'pause') break

    const chunk = chunks[i]
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('md5', fileMd5.value)
    formData.append('chunkIndex', String(i))
    formData.append('totalChunks', String(totalChunkCount.value))
    formData.append('fileName', fileInfo.value!.name)

    const controller = new AbortController()
    abortControllerList.push(controller)
    
    const task = request({
      url: '/upload/chunk',
      method: 'post',
      data: formData,
      signal: controller.signal,
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(() => {
       setTimeout(() => {
        // 暂停之后不要继续增加进度
        if(status.value !== 'pause'){
          finishedChunkIndex.value.push(i)
        }
      }, 800) // 拉长延时，方便看到暂停按钮
    }).catch((e) => {
      // 主动终止不算报错
      if (e.name !== 'AbortError') status.value = 'error'
    })
    tasks.push(task)
    // 控制并发
    if (tasks.length >= concurrency) {
      await Promise.race(tasks)
      tasks.splice(0, tasks.length)
      // 每一批任务跑完再次判断是否暂停
      if(status.value === 'pause') break
    }
  }
  await Promise.all(tasks)

  // 只有不是暂停状态，才执行合并,全部分片上传完成，调用合并接口
  if (status.value !== 'pause'&&finishedChunkIndex.value.length === totalChunkCount.value) {
    await mergeChunks()
  }
}

// 请求后端合并分片
const mergeChunks = async () => {
  await new Promise(r => setTimeout(r, 600))
  try {
    await request({
      url: '/upload/merge',
      method: 'post',
      data: {
        md5: fileMd5.value,
        fileName: fileInfo.value!.name,
        totalChunks: totalChunkCount.value
      }
    })
    status.value = 'success'
    ElMessage.success('文件上传&合并完成')
  } catch (err){
    status.value = 'error'
    ElMessage.error('分片合并失败')
  }
}

// 暂停上传：中断所有请求
const pauseUpload = () => {
  status.value = 'pause'
  abortControllerList.forEach(ctrl => ctrl.abort())
}

// 继续上传
const resumeUpload = async () => {
  status.value = 'uploading'
  abortControllerList = []
  await startUploadChunks()
}

// 清空全部状态
const clearUpload = () => {
  abortControllerList.forEach(ctrl => ctrl.abort())
  resetAll()
}
const resetAll = () => {
  status.value = 'wait'
  fileInfo.value = null
  fileMd5.value = ''
  totalChunkCount.value = 0
  finishedChunkIndex.value = []
  chunks = []
  abortControllerList = []
  calcMd5Loading.value = false
  uploadRef.value?.clearFiles()
  fileList.value = []
}
</script>

<style scoped>
.chunk-upload {}
.file-item {
  background: #fff;
}
.file-name {
  font-weight: 500;
}
</style>