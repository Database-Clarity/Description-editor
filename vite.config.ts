import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react()],
   base: './',
   resolve: {
      alias: {
         src: '/src'
      }
   },
   build: {
      target: 'esnext',
      minify: false,
   },
   define: {
      '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  }
})
