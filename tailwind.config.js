/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts}",
    "./data/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#627d98",
          500: "#486581",
          600: "#334e68",
          700: "#243b53",
          800: "#102a43",
          900: "#0a1929",
          950: "#050d1a",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb5ff",
          400: "#5a8cff",
          500: "#3b6cff",
          600: "#2a4ef5",
          700: "#2238db",
          800: "#1e30b0",
          900: "#1e2d8a",
        },
        violet: {
          500: "#7c5cfc",
          600: "#6c44f5",
        },
        cyan: {
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(16, 42, 67, 0.06), 0 4px 16px -4px rgba(16, 42, 67, 0.08)",
        card: "0 1px 3px -1px rgba(16, 42, 67, 0.08), 0 8px 24px -8px rgba(16, 42, 67, 0.10)",
        glow: "0 0 40px -10px rgba(59, 108, 255, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
}

