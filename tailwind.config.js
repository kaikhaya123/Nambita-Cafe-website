/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: {
          50: '#f9f9f9',
          100: '#f0f0f0',
          200: '#EAEAEA',
          300: '#c0c0c0',
          400: '#808080',
          500: '#606060',
          600: '#555555',
          700: '#202020',
          800: '#101010',
          900: '#111111',
        },
        primary: '#FFFF00',
        warmwhite: '#FAF8F3',
        cream: '#F4EFD8',
        caramel: '#C98A2B',
        forest: '#3F6B3C',
      },
      fontFamily: {
        'nc-serif': ['var(--font-nc-serif)', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        teko: ['var(--font-teko)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
