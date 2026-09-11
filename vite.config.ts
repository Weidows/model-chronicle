import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * `base` is injected per host:
 *   GitHub Pages project site -> VITE_BASE=/model-chronicle/
 *   Cloudflare Pages / custom domain -> VITE_BASE=/ (default)
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE ?? '/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    cssMinify: 'lightningcss',
  },
})
