/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Strict Monochrome & Soft UI
        'gemini-bg': '#FFFFFF',
        'gemini-surface': '#F9F9F9',
        'gemini-surface-hover': '#FFFFFF',
        'gemini-primary': '#000000',
        'gemini-primary-hover': '#171717',
        'gemini-text': '#000000',
        'gemini-text-secondary': '#666666',
        'gemini-border': '#E5E5E5',
        'gemini-active-bg': '#FFFFFF',
        'gemini-active-text': '#000000',
        // 保持向后兼容
        'ai-bg': '#FFFFFF',
        'ai-surface': '#F9F9F9',
        'ai-primary': '#000000',
        'ai-primary-dark': '#171717',
        'ai-secondary': '#000000',
        'ai-text': '#000000',
        'ai-text-muted': '#666666',
        'ai-border': '#E5E5E5',
        'ai-active-bg': '#FFFFFF',
        'ai-active-text': '#000000',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '24px',
        'input': '9999px', // 胶囊形或 rounded-3xl
        'button': '9999px',
        'dropdown': '16px', // rounded-2xl
      },
      boxShadow: {
        'gemini-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gemini-md': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'gemini-focus': '0 1px 6px 0 rgba(0, 0, 0, 0.1), 0 2px 12px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
