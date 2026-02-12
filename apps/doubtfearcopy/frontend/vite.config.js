import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Critical: Ensure static assets are served correctly
  assetsInclude: ['**/*.html', '**/*.css', '**/*.js', '**/*.png', '**/*.jpg', '**/*.gif'],
  
  // Handle public folder assets
  define: {
    global: 'globalThis',
  },
  
  // Ensure proper asset handling
  css: {
    devSourcemap: true
  }
})
