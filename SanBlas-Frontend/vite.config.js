import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jsonbin': {
        target: 'https://api.jsonbin.io/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jsonbin/, ''),
        headers: {
          'X-Access-Key': 'tu_access_key'
        }
      }
    }
  }
})