import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        'surface-muted': 'rgb(var(--surface-muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        // Legacy aliases keep untouched screens visually consistent during migration.
        panel: 'rgb(var(--surface-elevated) / <alpha-value>)',
        panel2: 'rgb(var(--surface-muted) / <alpha-value>)',
        panelInset: 'rgb(var(--surface-muted) / <alpha-value>)',
        borderSoft: 'rgb(var(--border) / <alpha-value>)',
        textSoft: 'rgb(var(--text-muted) / <alpha-value>)',
        textBody: 'rgb(var(--text-secondary) / <alpha-value>)',
        textStrong: 'rgb(var(--text-primary) / <alpha-value>)',
        accent: 'rgb(var(--primary) / <alpha-value>)',
        onAccent: 'rgb(255 255 255 / <alpha-value>)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.12), 0 24px 60px rgba(0, 0, 0, 0.32)',
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
} satisfies Config;
