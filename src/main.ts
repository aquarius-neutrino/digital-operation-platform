import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'element-plus/dist/index.css'
import 'uno.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import vPermission  from '@/directive/permission'
// 引入Element Plus暗黑CSS变量，原生支持html.dark切换
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入公共组件
import * as utils from '@/utils/common'
const app = createApp(App)
app.directive('permission', vPermission)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
// 挂载全局属性
app.config.globalProperties.$utils = utils
// 全局注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
