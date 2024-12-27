/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#28a9eb",
        primary1: "#93648d",
        primary2: "#4cc3d9",
        primary3: "#7bc8a4",
        primary4: "#f16745",
      },
      maxHeight: {
        '100vh-96': 'calc(100vh - 96px)',
      },
    },
  },
  plugins: [],
}

