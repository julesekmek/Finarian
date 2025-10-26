/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors inspired by Finary
        'dark': {
          'bg': '#0C0F16',
          'card': '#111827',
          'hover': '#1E293B',
        },
        'text': {
          'primary': '#F1F5F9',
          'secondary': '#94A3B8',
          'muted': '#64748B',
        },
        'accent': {
          'primary': '#F1C086',
          'beige': '#E8DCC8',
          'green': '#22C55E',
          'red': '#EF4444',
        },
        'border': {
          'subtle': '#1E293B',
          'default': '#334155',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'satoshi': ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0px 2px 8px rgba(0, 0, 0, 0.4)',
        'card': '0px 4px 16px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 20px rgba(241, 192, 134, 0.3)',
        'glow-beige': '0 0 12px rgba(232, 220, 200, 0.2)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom right, #0C0F16, #1E293B)',
        'gradient-card': 'linear-gradient(135deg, #111827 0%, #1E293B 100%)',
        'gradient-primary': 'linear-gradient(135deg, #F1C086 0%, #E8A860 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

