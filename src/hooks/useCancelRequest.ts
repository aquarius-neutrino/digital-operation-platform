// 页面销毁时自动取消当前页面所有未完成请求，避免弹窗残留报错
import { onUnmounted } from 'vue'
import { cancelAllRequest } from '@/utils/request'

export function useCancelRequest() {
  onUnmounted(() => {
    cancelAllRequest()
  })
}