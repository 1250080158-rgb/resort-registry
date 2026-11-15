import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite 8 (rolldown) chỉ nhận manualChunks dạng hàm, không nhận object
const manualChunks = (id: string): string | undefined => {
  if (id.includes('node_modules/react-dom') || /[\\/]node_modules[\\/](react|scheduler)[\\/]/.test(id)) {
    return 'react-vendor';
  }
  if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) {
    return 'recharts';
  }
  return undefined;
};

// Production build config for Spring Boot integration
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks,
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})