import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0B1220',
        panel: '#101827',
        panel2: '#151F32',
        borderSoft: '#25324A',
        textSoft: '#93A4BD',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.12), 0 24px 60px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [],
} satisfies Config;
