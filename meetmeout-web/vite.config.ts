import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      https: {
      key: fs.readFileSync('./src/certs/192.168.1.42-key.pem'),
      cert: fs.readFileSync('./src/certs/192.168.1.42.pem'),
      },
      host: '192.168.1.42',
      port: 5173
    },
  
  define: {
    global: {},
  },
})


