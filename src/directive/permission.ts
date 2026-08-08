import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const userStore = useUserStore()
    // 当前按钮需要的权限标识数组
    const needPerms = binding.value
    if (!Array.isArray(needPerms)) return

    // 用户拥有的权限集合
    const userPerms: string[] = userStore.userInfo?.permissions || []

    // 判断是否包含任意一个权限，没有权限移除DOM
    const hasPermission = needPerms.some(p => userPerms.includes(p))
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default vPermission