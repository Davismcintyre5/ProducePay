export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#0d3d12'
        },
        surface: {
          light: '#ffffff',
          muted: '#f4f6f9',
          card: '#ffffff',
          dark: '#0f172a',
          darkMuted: '#1e293b',
          darkCard: '#1e293b'
        },
        success: {
          light: '#e8f5e9',
          DEFAULT: '#2e7d32',
          dark: '#1b5e20'
        },
        warning: {
          light: '#fff8e1',
          DEFAULT: '#ef6c00',
          dark: '#e65100'
        },
        danger: {
          light: '#ffebee',
          DEFAULT: '#c62828',
          dark: '#8e0000'
        },
        info: {
          light: '#e3f2fd',
          DEFAULT: '#1565c0',
          dark: '#0d47a1'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      borderRadius: {
        card: '0.75rem'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)'
      }
    }
  },
  plugins: []
};