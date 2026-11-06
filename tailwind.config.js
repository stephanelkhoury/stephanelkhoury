/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--accent-primary)',
        secondary: 'var(--accent-secondary)',
        success: 'var(--accent-success)',
        muted: 'var(--muted)',
        surface: 'var(--surface)',
        // Multigraphic operations design tokens; values come from theme.css per light/dark theme.
        ops: Object.fromEntries(['bg', 'surface', 'surface-raised', 'border', 'border-strong', 'text', 'muted', 'subtle', 'accent', 'accent-strong', 'on-accent', 'blue', 'violet', 'green', 'amber', 'red'].map(name => [name, `rgb(var(--ops-${name}-rgb) / <alpha-value>)`])),
      },
      backgroundColor: {
        card: 'var(--card-bg)',
      },
      borderColor: {
        card: 'var(--card-border)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
