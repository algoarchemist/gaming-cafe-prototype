import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e0e0e0",
        "neon-blue": "#00d4ff",
        "neon-pink": "#ff2d78",
        "neon-green": "#39ff14",
        "neon-purple": "#b84dff",
        "neon-yellow": "#ffe600",
        "card-bg": "rgba(255, 255, 255, 0.04)",
        "card-border": "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        heading: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "neon-blue": "0 0 15px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.1)",
        "neon-pink": "0 0 15px rgba(255, 45, 120, 0.4), 0 0 60px rgba(255, 45, 120, 0.1)",
        "neon-green": "0 0 15px rgba(57, 255, 20, 0.4), 0 0 60px rgba(57, 255, 20, 0.1)",
        "neon-purple": "0 0 15px rgba(184, 77, 255, 0.4), 0 0 60px rgba(184, 77, 255, 0.1)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.36)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
