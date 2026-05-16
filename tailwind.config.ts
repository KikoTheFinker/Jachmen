import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        k: {
          bg:       '#09090b',  // zinc-950
          surface:  '#111113',  // dark surface
          raised:   '#1c1c1f',  // elevated — cards, hover states
          border:   '#27272a',  // zinc-800
          text:     '#f4f4f5',  // zinc-50
          muted:    '#a1a1aa',  // zinc-400
          subtle:   '#52525b',  // zinc-600 — very muted
          accent:   '#f59e0b',  // amber-500 — Vergina gold, the sun on the flag
          accentDim:'rgba(245,158,11,0.12)',
          red:      '#ef4444',  // red-500 — Macedonian red
        },
      },
      boxShadow: {
        card:  '0 0 0 1px rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.4)',
        glow:  '0 0 24px rgba(245,158,11,0.18)',
        modal: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
