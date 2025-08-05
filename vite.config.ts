import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui';
            }
            if (id.includes('axios') || id.includes('zod') || id.includes('react-hook-form')) {
              return 'utils';
            }
            return 'vendor';
          }
          
          // Analytics chunks
          if (id.includes('/Analytics/')) {
            if (id.includes('Dashboard')) {
              return 'analytics-dashboards';
            }
            if (id.includes('RealTimeMonitor')) {
              return 'analytics-realtime';
            }
            return 'analytics';
          }
          
          // Main app chunk
          if (id.includes('/src/')) {
            return 'app';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
