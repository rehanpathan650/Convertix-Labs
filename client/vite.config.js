import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [] } }, // ignore stray postcss/tailwind configs in parent folders
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
