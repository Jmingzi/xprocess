import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: './server/public'
  },
  server: {
    proxy: {
      '/xprocess': {
        target: 'http://localhost:9527',
        changeOrigin: true
      }
    }
  }
})
