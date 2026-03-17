import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '',
  publicDir: false,   // static assets already live in gbe/ root
  build: {
    outDir: '../',      // build straight into gbe/ — no copy step needed
    emptyOutDir: false, // don't wipe src-app/ or other gbe files
  },
})
