import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy /xui-api -> your real 3x-ui panel, so `npm run dev` can also
      // talk to it without CORS issues (mirrors the production Nginx setup
      // in nginx/3xui-custom-ui.conf). Only used for local `npm run dev`.
      proxy: {
        '/xui-api': {
          target: 'https://127.0.0.1:2026',
          changeOrigin: true,
          secure: false, // self-signed cert on the 3x-ui panel
          rewrite: (path: string) => path.replace(/^\/xui-api/, '/YQgWnJRukAuUgXEzrL'),
        },
      },
    },
  };
});
