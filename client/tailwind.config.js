/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          burgundy: '#C41E3A',
          gold: '#FFB81C',
          violet: '#6B2D5C'
        },
        earth: {
          terracotta: '#E2725B',
          olive: '#8B9F3D'
        },
        sky: {
          blue: '#0077B6'
        },
        mineral: {
          copper: '#B87333'
        },
        base: {
          white: '#FFFFFF',
          cream: '#FFFEF7'
        },
        text: {
          charcoal: '#2B2B2B',
          gray: '#505050'
        },
        border: {
          gray: '#CCCCCC'
        },
        functional: {
          success: '#00A676',
          warning: '#FF6B35',
          info: '#00B4D8'
        }
      },
      fontFamily: {
        primary: ['Inter', 'Helvetica Neue', 'sans-serif'],
        display: ['Space Grotesk', 'Futura', 'sans-serif']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem'
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
        wider: '0.1em'
      }
    },
  },
  plugins: [],
}
