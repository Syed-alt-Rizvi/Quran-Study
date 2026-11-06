import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@capacitor/core', '@capacitor/app', '@capacitor/haptics', 'lucide-react', 'motion/react'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
