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
          // Plain `bg-black`, `border-black/10`, `bg-black/50` etc. use this. Without it those classes do nothing.
          DEFAULT: '#000000',
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
        // Nambita brand colours. Change a colour here and it updates across the whole site.
        // Use them as e.g. `bg-brand-yellow`, `text-brand-green`, `border-brand-caramel/50`.
        brand: {
          yellow: '#FFFF00', // main Nambita yellow: navbar, buttons, highlights
          green: '#3F6B3C', // "ready" states, about page, location accents
          caramel: '#C98A2B', // hover and warning accents
          cream: '#F4EFD8', // soft card backgrounds
          offwhite: '#FAF8F3', // default page background
        },
      },
      fontFamily: {
        'nc-serif': ['var(--font-nc-serif)', 'serif'],
        // Default body text font (DM Sans). Used by `font-sans` and by any text without its own font class.
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        teko: ['var(--font-teko)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
