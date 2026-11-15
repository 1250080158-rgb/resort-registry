import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === 'development'

  return {
    base: '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8080', // Đảm bảo Backend Spring Boot đang chạy ở port 8080
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'http://localhost:8080',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'http://localhost:8080',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})