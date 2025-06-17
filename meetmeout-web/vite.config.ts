import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./src/certs/10.22.11.61-key.pem'),
      cert: fs.readFileSync('./src/certs/10.22.11.61.pem'),
    },
    host: '10.22.11.61',
    port: 5173,
  },
  define: {
    global: {},
  },
})
