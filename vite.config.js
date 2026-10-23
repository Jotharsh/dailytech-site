import { defineConfig } from 'vite'
// base './' so the built site works from any folder (GitHub Pages sub-path, custom domain, or opened directly).
export default defineConfig({ base: './', build: { target: 'es2020' } })
