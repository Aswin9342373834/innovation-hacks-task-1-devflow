import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL

  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react()],
    ...(apiUrl
      ? {
          define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
          },
        }
      : {}),
  }
})
