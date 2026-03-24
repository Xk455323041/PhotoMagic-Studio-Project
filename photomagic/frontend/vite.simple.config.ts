import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 最简单的配置，避免任何插件冲突
export default defineConfig({
  plugins: [
    react({
      // 使用最简单的配置
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3003,
    host: '0.0.0.0',
  },
})