import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ✅ React plugin import qilindi

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // backend port
        changeOrigin: true
      }
    }
  }
});
