import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: "Texas Porch" palette (Neighbrd Brand Playbook 2026)
        ink: { DEFAULT: '#172A3A', 2: '#1f3547' }, // Deep Navy — primary
        cream: '#F7F0E6', // Warm Cream — background
        paper: '#FBF7EF',
        rust: { DEFAULT: '#C7663A', soft: '#e0916a' }, // Clay Orange — primary action
        gold: '#F2B84B', // Golden Sun — celebratory
        sage: { DEFAULT: '#7D9270', soft: '#9bab90' }, // Sage Green — calm / done
        charcoal: '#262626', // Text
        muted: { DEFAULT: '#6b7785', 2: '#9a9384' },
        line: { DEFAULT: '#E8DDC9', cool: '#e6e1d3' }, // Limestone — borders
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-spline-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '16px' },
      boxShadow: { card: '0 1px 2px rgba(22,33,46,.04), 0 6px 24px rgba(22,33,46,.05)' },
    },
  },
  plugins: [],
} satisfies Config;
