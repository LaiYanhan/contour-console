/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        endfield: {
          bg: '#080A0D',
          surface: '#11141A',
          card: '#161B22',
          border: '#273142',
          'border-bright': '#3F4D63',
          yellow: '#F5C400',
          'yellow-light': '#FFE840',
          'yellow-glow': 'rgba(245, 196, 0, 0.45)',
          cyan: '#00E5FF',
          emerald: '#00FF9D',
          crimson: '#FF2A55',
          amber: '#FF9500',
          slate: '#8A99AD',
          muted: '#4B5565',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(245, 196, 0, 0.25)',
        'glow-yellow-sm': '0 0 8px rgba(245, 196, 0, 0.35)',
        'glow-cyan': '0 0 15px rgba(0, 229, 255, 0.3)',
        'glow-crimson': '0 0 15px rgba(255, 42, 85, 0.3)',
      },
    },
  },
  plugins: [],
};
