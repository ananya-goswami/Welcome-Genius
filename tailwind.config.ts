import type { Config } from 'tailwindcss';

/**
 * Brand tokens are transcribed verbatim from docs/GAME_SPEC.md §8.
 * The same six values are also declared as CSS custom properties in
 * src/index.css (`--cg-*`) for raw-CSS use, keep the two in sync.
 * Hex literals (not `var(...)`) are used here so Tailwind's opacity
 * modifiers (e.g. `bg-cg-indigo/20`) keep working.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cg: {
          indigo: '#4B45A8', // primary, headers, CTAs
          teal: '#7DCFC9', // accent, progress bar fill, success states
          navy: '#232048', // body text, dark navy, never pure black
          cream: '#FBF0E4', // page background
          lilac: '#E9E5F7', // card backgrounds
          white: '#FFFFFF', // base surfaces
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // soft, indigo-tinted, never harsh black (§8)
        cg: '0 8px 24px rgba(75, 69, 168, 0.15)',
        'cg-lg': '0 16px 40px rgba(75, 69, 168, 0.20)',
      },
      backgroundImage: {
        // primary CTA gradient (§8)
        'cg-cta': 'linear-gradient(135deg, #4B45A8 0%, #7DCFC9 100%)',
        // full-bleed splash backdrop (§5.1)
        'cg-splash': 'linear-gradient(160deg, #4B45A8 0%, #232048 100%)',
      },
      minHeight: {
        tap: '44px', // minimum tap target (CLAUDE.md rule 5)
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
