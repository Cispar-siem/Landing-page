import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel serves the application from the domain root. Keep this explicit so
  // asset URLs do not retain the old GitHub Pages repository prefix.
  base: '/',
});
