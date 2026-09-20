/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        dark: {
          text: '#0F172A',
        },
        secondary: {
          text: '#64748B',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
      },
    },
  },
  plugins: [],
}
