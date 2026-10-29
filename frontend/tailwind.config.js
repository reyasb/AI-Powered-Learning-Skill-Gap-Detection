/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080912',
          card: '#101321',
          cardHover: '#17192B',
          panel: '#0D0F1B',
          border: '#1F2438',
          borderGlow: '#2E3553'
        },
        neon: {
          violet: '#8B5CF6',
          purple: '#C026D3',
          cyan: '#22D3EE',
          blue: '#3B82F6',
          green: '#34D399',
          amber: '#FBBF24',
          rose: '#FB7185'
        }
      },
      boxShadow: {
        'neon-violet': '0 0 15px -3px rgba(139, 92, 246, 0.35)',
        'neon-cyan': '0 0 15px -3px rgba(34, 211, 238, 0.35)',
        'neon-purple': '0 0 15px -3px rgba(192, 38, 211, 0.35)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)'
      }
    },
  },
  plugins: [],
}
