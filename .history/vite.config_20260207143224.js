import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'stock-tracker',
    port: 5185,
    proxy: {
      '/api': 'http://localhost:5500',
    },
  },
})
