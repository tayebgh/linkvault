import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        border: 'var(--border-color)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        muted: 'var(--muted)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--muted)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-code': 'var(--accent2)',
            '--tw-prose-pre-bg': 'var(--surface2)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
