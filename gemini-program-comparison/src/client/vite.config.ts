import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Assuming backend runs on 5000 or 5xxx
        changeOrigin: true,
        secure: false,
      },
      '/cryptohub': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
