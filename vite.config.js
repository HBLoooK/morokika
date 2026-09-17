import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build:{modulePreload:{resolveDependencies:(_filename,deps)=>deps.filter(dep=>!dep.includes('supabase'))},rollupOptions:{output:{manualChunks(id){if(id.includes('@supabase')||id.includes('/node_modules/@supabase/'))return 'supabase';if(id.includes('/node_modules/lucide-react/'))return 'icons'}}}},
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})
