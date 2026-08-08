// axios二次封装
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearToken } from './storage'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use((config) => {
  const token = getToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    return res.data
  },
  (error) => {
    const msg = error.response?.data?.msg || '网络请求异常'
    const status = error.response?.status
    // token过期，跳转登录
    if (status === 401) {
      clearToken()
      router.push('/login')
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service