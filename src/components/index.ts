//全局注册组件
import VirtualTable from './VirtualTable/index.vue'

export default {
  install(app: any) {
    app.component('VirtualTable', VirtualTable)
  }
}
