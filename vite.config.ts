import { sveltekit } from '@sveltejs/kit/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), basicSsl(), devtoolsJson()],
  server: {
    proxy: {},
  },
})
