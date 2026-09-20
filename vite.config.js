import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/innovation-hacks-task-1-devflow/',
  plugins: [react()],
})
