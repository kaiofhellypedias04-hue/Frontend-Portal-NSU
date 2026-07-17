import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        panel2: 'rgb(var(--panel2) / <alpha-value>)',
        panelInset: 'rgb(var(--panel-inset) / <alpha-value>)',
        borderSoft: 'rgb(var(--border-soft) / <alpha-value>)',
        textSoft: 'rgb(var(--text-soft) / <alpha-value>)',
        textBody: 'rgb(var(--text-body) / <alpha-value>)',
        textStrong: 'rgb(var(--text-strong) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        onAccent: 'rgb(var(--on-accent) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.12), 0 24px 60px rgba(0, 0, 0, 0.32)',
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
} satisfies Config;
