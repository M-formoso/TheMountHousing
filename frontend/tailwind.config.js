/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme.js'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3F0',
          100: '#E8E4DE',
          200: '#D1C9BD',
          300: '#BAAE9C',
          400: '#A3937B',
          500: '#8C785A',
          600: '#70604B',
          700: '#54483C',
          800: '#38302D',
          900: '#1C181E',
        },
        secondary: {
          50: '#F7F7F7',
          100: '#EFEFEF',
          200: '#DFDFDF',
          300: '#CFCFCF',
          400: '#BFBFBF',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1A1A1A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}
