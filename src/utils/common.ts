// 统一归集节流、防抖、日期格式化、权限判断、存储操作等高频工具，全项目复用
/**
 * 防抖函数
 * @param fn 执行函数
 * @param delay 延迟毫秒
 */
export function debounce(fn: Function, delay = 300) {
  let timer: NodeJS.Timeout | null
  return function (...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 执行函数
 * @param interval 间隔毫秒
 */
export function throttle(fn: Function, interval = 300) {
  let lastTime = 0
  return function (...args: any[]) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 日期格式化
 * @param date 时间戳/日期对象
 * @param fmt 格式 yyyy-MM-dd HH:mm:ss
 */
export function formatDate(date: number | Date, fmt = 'yyyy-MM-dd HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  const obj: Record<string, number> = {
    'y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  for (const key in obj) {
    const reg = new RegExp(`(${key})`)
    if (reg.test(fmt)) {
      const str = obj[key].toString()
      fmt = fmt.replace(reg, key.length === 1 ? str : str.padStart(key.length, '0'))
    }
  }
  return fmt
}

/**
 * 判断用户是否拥有指定权限
 * @param perm 权限标识
 */
import { useUserStore } from '@/store/user'
export function hasPerm(perm: string | string[]) {
  const userStore = useUserStore()
  const perms = userStore.userInfo?.permissions || []
  if (Array.isArray(perm)) return perm.some(p => perms.includes(p))
  return perms.includes(perm)
}

/**
 * localStorage 存取封装
 */
export const storage = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get<T>(key: string): T | null {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}