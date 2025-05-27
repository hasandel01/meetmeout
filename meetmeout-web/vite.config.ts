import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./src/certs/192.168.1.39-key.pem'),
      cert: fs.readFileSync('./src/certs/192.168.1.39.pem'),
    },
    host: '192.168.1.39',
    port: 5173,
  },
  define: {
    global: {},
  },
})
