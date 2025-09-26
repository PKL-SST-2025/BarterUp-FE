import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    solid(),tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls ke backend
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: { 
    target: 'esnext',
    outDir: 'dist'
  },
})
