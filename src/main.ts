import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus,{ ElMessage } from 'element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'element-plus/dist/index.css'
import 'uno.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import vPermission  from '@/directive/permission'
// 引入Element Plus暗黑CSS变量，原生支持html.dark切换
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入公共组件
import * as utils from '@/utils/common'
//虚拟表格滚动引入
import components from '@/components'
const app = createApp(App)
app.use(components)
app.directive('permission', vPermission)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
// 挂载全局属性
app.config.globalProperties.$utils = utils
// 全局注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 全局Vue组件错误捕获
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局异常捕获:', err, instance, info)
  ElMessage.error('页面渲染发生异常，请刷新页面重试')
}

// 全局原生JS错误、资源加载错误捕获
window.onerror = function(message, source, lineno, colno, error) {
  console.error('全局JS错误:', message, source, lineno)
  return true
}

// 异步Promise未捕获错误捕获（接口异步报错兜底）
window.addEventListener('unhandledrejection', (event) => {
  console.error('异步Promise未捕获异常:', event.reason)
  event.preventDefault()
})
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
