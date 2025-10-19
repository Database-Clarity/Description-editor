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

// add type for vite plugin

function something(): PluginOption {
  return {
    name: 'something',
    buildStart() {
      console.log('buildStart')
    },
    transform(code, id) {
      return code.replace('something', 'something else')
    }
  }
}