import type { Config } from 'tailwindcss';

/**
 * Khet Se design tokens.
 * Brand rule: SQUARE CORNERS EVERYWHERE. Every radius utility resolves to 0,
 * so `rounded-*` classes (including ones copied from shadcn) can never round a box.
 */
const square = {
  none: '0',
  sm: '0',
  DEFAULT: '0',
  md: '0',
  lg: '0',
  xl: '0',
  '2xl': '0',
  '3xl': '0',
  full: '0',
};

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1200px' } },
    borderRadius: square,
    extend: {
      colors: {
        leaf: { DEFAULT: '#2F6B3B', dark: '#1F4A28', light: '#3E8A4D' },
        sprout: '#E7F0E3',
        cream: '#FAF7F0',
        sand: '#EFE8DA',
        soil: { DEFAULT: '#2A2620', muted: '#6B645A' },
        turmeric: '#C98A1B',
        line: '#E3DDD0',
        danger: '#B42318',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,38,32,0.04), 0 4px 16px rgba(42,38,32,0.06)',
      },
      maxWidth: { site: '1200px' },
    },
  },
  plugins: [],
};

export default config;
