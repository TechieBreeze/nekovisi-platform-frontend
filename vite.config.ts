import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})