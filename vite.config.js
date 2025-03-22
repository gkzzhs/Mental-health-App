import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true
  },
  base: './' // 添加相对路径配置，确保在任何路径下都能正确加载资源
})