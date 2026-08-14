import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// 存储进行中的请求，用于重复请求取消
const pendingMap = new Map<string, AbortController>()
// 最大重试次数
const MAX_RETRY_COUNT = 2
// 请求超时时间
const TIMEOUT = 15000

// 生成请求唯一key（method+url+参数）
function generateReqKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 添加请求到pendingMap
function addPending(config: AxiosRequestConfig) {
  const reqKey = generateReqKey(config)
  const controller = new AbortController()
  config.signal = controller.signal
  if (!pendingMap.has(reqKey)) {
    pendingMap.set(reqKey, controller)
  }
}

// 取消单个重复请求
function removePending(config: AxiosRequestConfig) {
  const reqKey = generateReqKey(config)
  if (pendingMap.has(reqKey)) {
    const ctrl = pendingMap.get(reqKey)
    ctrl?.abort('重复请求已取消')
    pendingMap.delete(reqKey)
  }
}

// 取消全部请求（退出登录/页面销毁调用）
export function cancelAllRequest() {
  pendingMap.forEach(ctrl => ctrl.abort('用户主动取消请求'))
  pendingMap.clear()
}

const service = axios.create({
  baseURL: '/api',
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 携带token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    // 取消重复请求
    removePending(config)
    addPending(config)
    return config
  },
  (err: AxiosError) => Promise.reject(err)
)

// 响应拦截器（核心：重试、错误捕获）
service.interceptors.response.use(
  (res: AxiosResponse) => {
    removePending(res.config)
    const data = res.data
    // 业务码统一处理
    if (data.code !== 200) {
      ElMessage.error(data.msg || '接口业务异常')
      return Promise.reject(data)
    }
    return data
  },
  async (err: AxiosError) => {
    removePending(err.config || {})
    const config = err.config
    // 主动取消的请求不报错提示
    if (err.name === 'AbortError') {
      return Promise.reject('请求已主动取消')
    }

    // 超时/网络错误自动重试
    if (config && !config.__retryCount) {
      config.__retryCount = 0
    }
    if (config && config.__retryCount < MAX_RETRY_COUNT) {
      config.__retryCount += 1
      ElMessage.warning(`请求超时，正在第${config.__retryCount}次重试...`)
      // 延时重试
      await new Promise(resolve => setTimeout(resolve, 1000))
      return service(config)
    }

    // 状态码统一捕获
    const status = err.response?.status
    switch (status) {
      case 401:
        ElMessage.error('登录已失效，请重新登录')
        const userStore = useUserStore()
        userStore.logout()
        break
      case 403:
        ElMessage.error('暂无权限访问该资源')
        break
      case 404:
        ElMessage.error('请求接口不存在(404)')
        break
      case 500:
        ElMessage.error('服务器内部错误(500)')
        break
      default:
        ElMessage.error('网络异常，请检查网络连接')
    }
    return Promise.reject(err)
  }
)

export default service