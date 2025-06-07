module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: "#f8f9fa",
        primary: "#1d4ed8",
        secondary: "#2563eb",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 10s ease-in-out infinite", // שם אחר!
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-30px)" },
        },
      },
    },
  },
  plugins: [],
};
