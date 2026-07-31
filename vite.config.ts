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

      // Proxy to Railway backend
      proxy: {
        '/api': {
          target: 'https://au718git-production.up.railway.app',
          changeOrigin: true,
          secure: true,           // Railway uses HTTPS
          timeout: 30000,
          proxyTimeout: 30000,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // optional
        },
      },

      watch: {
        ignored: [
          '**/db.json',
          '**/db.json.tmp',
          '**/node_modules/**',
          '**/dist/**',
        ],
      },
    },

    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});