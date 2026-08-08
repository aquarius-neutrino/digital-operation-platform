// unocss配置
import { defineConfig, presetUno} from 'unocss'

export default defineConfig({
   presets: [
    presetUno()
  ],
  // 原生class暗黑模式，和Element Plus完全兼容
  darkMode: {
    type: 'class'
  },
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center',
  }
})