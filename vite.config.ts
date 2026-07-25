import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      strictPort: true,

      // Proxy to backend (this is what you need)
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          timeout: 15000,
          proxyTimeout: 15000,
        }
      },

      watch: {
        ignored: [
          '**/db.json',
          '**/db.json.tmp',
          '**/node_modules/**',
          '**/dist/**',
        ],
      },

      hmr: {
        overlay: true,
      },
    },

    build: {
      sourcemap: mode !== 'production',
    },
  };
});