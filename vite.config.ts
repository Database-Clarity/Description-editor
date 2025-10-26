import { sveltekit } from '@sveltejs/kit/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, type PluginOption } from 'vite'
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [Inspect(), sveltekit(), basicSsl()],
  server: {
    proxy: {},
  },
})
