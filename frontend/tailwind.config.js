/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Цвета из ТЗ (для рейтинга)
        "rank-1": "#14532d",
        "rank-2": "#166534",
        "rank-3": "#22c55e",
        "rank-4": "#a3e635",
        "rank-5": "#fde047",
        "rank-6": "#f97316",
        "rank-7": "#ef4444",
        "rank-8": "#7f1d1d",
        "bg-dark": "#0f172a",
        "panel-dark": "#1e293b",
      },
    },
  },
  plugins: [],
};
