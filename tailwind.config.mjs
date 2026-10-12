/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        endfield: {
          bg: '#0A0C0F',
          surface: '#11141B',
          card: '#161A22',
          'card-hover': '#1C222D',
          border: '#222A38',
          'border-bright': '#354256',
          // Official Endfield Hazard Signal Yellow
          yellow: '#FFE600',
          'yellow-light': '#FFF066',
          'yellow-dim': '#B8A600',
          'yellow-glow': 'rgba(255, 230, 0, 0.45)',
          cyan: '#00E5FF',
          emerald: '#00FF9D',
          crimson: '#FF2D46',
          amber: '#FF8800',
          slate: '#707E94',
          muted: '#404A5C',
          white: '#F0F4F8',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'Iosevka', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        tactical: '0 16px 48px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'tactical-card': '0 8px 24px -4px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        'glow-yellow': '0 0 24px rgba(255, 230, 0, 0.35)',
        'glow-yellow-sm': '0 0 10px rgba(255, 230, 0, 0.45)',
        'glow-cyan': '0 0 18px rgba(0, 229, 255, 0.35)',
        'glow-crimson': '0 0 18px rgba(255, 45, 70, 0.35)',
      },
    },
  },
  plugins: [],
};
