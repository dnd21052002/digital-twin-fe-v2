import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        panel: 'var(--bg-panel)',
        primary: 'var(--primary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        critical: 'var(--critical)',
        maintenance: 'var(--maintenance)',
        unknown: 'var(--unknown)',
      },
    },
  },
  plugins: [],
} satisfies Config;
