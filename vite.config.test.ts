import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@supabase/supabase-js': path.resolve(__dirname, 'tests/mocks/supabase.ts'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '"https://mock.supabase.co"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '"mock-key"',
    'import.meta.env.VITE_PLATFORM_API_URL': '"http://localhost:8787"',
    'import.meta.env.VITE_RELEASE_MANIFEST_URL': '"/releases.json"',
    'import.meta.env.VITE_WHATSAPP_NUMBER': '"5491100000000"',
  },
});