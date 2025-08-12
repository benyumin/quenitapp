/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'accent': ['Poppins', 'Inter', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
        'code': ['Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'],
        'cascadia': ['Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'],
        'mono': ['Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'],
      },
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#252525',
        'bg-accent': '#2d2d2d',
        'accent-primary': '#ff6b35',
        'accent-secondary': '#f7931e',
        'accent-tertiary': '#4ecdc4',
        'accent-quaternary': '#45b7d1',
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-muted': '#a0a0a0',
        'text-accent': '#ffd700',
        'border-color': '#333333',
        'border-accent': '#ff6b35',
        'border-light': '#404040',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff6b35, #f7931e)',
        'gradient-secondary': 'linear-gradient(135deg, #4ecdc4, #45b7d1)',
        'gradient-accent': 'linear-gradient(135deg, #ff6b35, #ffd700)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      fontFeatureSettings: {
        'liga': 'liga 1',
        'calt': 'calt 1',
        'contextual': 'liga 1, calt 1',
      },
    },
  },
  plugins: [],
} 