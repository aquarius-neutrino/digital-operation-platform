// 封装localStorage的操作，统一加前缀，避免key冲突，统一持久化
const KEY_PREFIX = 'DIGITAL_'

export const setStorage = (key: string, value: unknown) => {
  localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value))
}

export const getStorage = <T>(key: string): T | null => {
  const val = localStorage.getItem(KEY_PREFIX + key)
  if (!val) return null
  try {
    return JSON.parse(val) as T
  } catch {
    return null
  }
}

export const removeStorage = (key: string) => {
  localStorage.removeItem(KEY_PREFIX + key)
}

// token快捷方法
export const setToken = (token: string) => setStorage('TOKEN', token)
export const getToken = () => getStorage<string>('TOKEN')
export const clearToken = () => removeStorage('TOKEN')