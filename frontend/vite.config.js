import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'; // ← Add this

export default defineConfig({
  plugins: [
    react(),
    svgr(), // ← Add this line
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});