import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('recharts') || id.includes('d3-'))
            return 'vendor-charts'

          if (id.includes('@supabase'))
            return 'vendor-supabase'

          if (id.includes('@tanstack'))
            return 'vendor-query'

          if (id.includes('react-dom') || id.includes('react-router') || id.includes('react/'))
            return 'vendor-react'

          if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance'))
            return 'vendor-ui'

          return 'vendor-misc'
        },
      },
    },
  },
})
