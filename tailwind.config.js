/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
