/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        DM: {
          10: 'hsl(0, 0%, 10%)',
          15: 'hsl(0, 0%, 15%)',
          25: 'hsl(0, 0%, 25%)',
          text: 'hsl(0, 0%, 85%)',
          accent: 'hsl(120, 80%, 50%)',
        },
        LM: {
          10: 'hsl(0, 0%, 90%)',
          15: 'hsl(0, 0%, 85%)',
          25: 'hsl(0, 0%, 75%)',
          text: 'hsl(0, 0%, 15%)',
          accent: 'hsl(120, 100%, 25%)',
        },
      },
    },
  },
  plugins: [],
}
