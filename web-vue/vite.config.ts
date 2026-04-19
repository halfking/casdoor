import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const BACKEND_TARGET = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': 'rgb(89,54,213)',
          'border-radius-base': '5px',
        },
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 7001,
    proxy: {
      '/api': { target: BACKEND_TARGET, changeOrigin: true },
      '/swagger': { target: BACKEND_TARGET, changeOrigin: true },
      '/files': { target: BACKEND_TARGET, changeOrigin: true },
      '/.well-known': { target: BACKEND_TARGET, changeOrigin: true },
      '/cas': { target: BACKEND_TARGET, changeOrigin: true },
      '/scim': { target: BACKEND_TARGET, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['/kxmemory-icon.svg'],
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          antd: ['ant-design-vue', '@ant-design/icons-vue'],
          i18n: ['vue-i18n'],
        },
      },
    },
  },
})
