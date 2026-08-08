import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteMockServe} from 'vite-plugin-mock'
import VueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import {resolve} from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    viteMockServe({
      mockPath: 'src/mock',
      // 新版本vite-plugin-mock变更，localEnabled已经被废弃
      //  localEnabled: true,//开发环境开启mock
      enable: true, // 开启mock,替代旧的localEnabled
      watchFiles: true, // mock文件改动自动刷新
      // prodEnabled: false
    }), 
    VueDevTools(), 
    UnoCSS()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 打包分包优化（简历性能优化点）
        manualChunks(id) {
        if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
          return 'vueCore'
        }
        if (id.includes('element-plus')) {
          return 'elementPlus'
        }
        if (id.includes('echarts')) {
          return 'charts'
        }
        }
      }
    }
  }
})
