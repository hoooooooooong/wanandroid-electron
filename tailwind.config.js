/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        sidebar: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        main: {
          light: '#f8fafc',
          dark: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
