import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          panel: 'var(--bg-panel)',
          'panel-soft': 'var(--bg-panel-soft)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
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
