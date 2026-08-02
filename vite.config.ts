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

      // Proxy configuration for Railway backend
      proxy: {
        '/api': {
          target: 'https://au718git-production.up.railway.app',
          changeOrigin: true,
          secure: true,
          timeout: 30000,
          proxyTimeout: 30000,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Proxy Error:', err);
            });
            proxy.on('proxyReq', (proxyReq) => {
              console.log(`Proxying request to: ${proxyReq.path}`);
            });
          },
        },
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