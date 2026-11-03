import type { Config } from "tailwindcss";

/**
 * 디자인 컨셉: "얼어붙은 나락" (Howling Abyss)
 *  - abyss  : 깊은 남색 배경 단계
 *  - frost  : 서리/얼음 하이라이트 (주 포인트 컬러)
 *  - aurora : 오로라 보조 색 (보라/청록)
 *  - ember  : MVP, 펜타킬 등 뜨거운 강조색
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyss: {
          950: "#05070d",
          900: "#080b14",
          800: "#0c111c",
          700: "#111827",
          600: "#182236",
          500: "#1f2b43",
        },
        frost: {
          50: "#f1fbff",
          100: "#dcf4ff",
          200: "#b6e8ff",
          300: "#7fd6ff",
          400: "#45bdf5",
          500: "#1ea0e0",
          600: "#157fbb",
          700: "#126597",
          800: "#15537a",
          900: "#164565",
        },
        aurora: {
          violet: "#a78bfa",
          teal: "#2dd4bf",
          pink: "#f472b6",
        },
        ember: {
          300: "#fcd34d",
          400: "#f6b23f",
          500: "#f08c2c",
          600: "#e2611d",
        },
        win: "#4cc2ff",
        lose: "#ff5c7a",
        ink: {
          100: "#eef3fb",
          200: "#cbd5e4",
          300: "#9aa8bf",
          400: "#6c7a93",
          500: "#4a556b",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "Inter", "system-ui", "sans-serif"],
        display: ["Pretendard Variable", "Pretendard", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        frost: "0 0 0 1px rgba(127,214,255,0.18), 0 10px 40px -10px rgba(69,189,245,0.25)",
        glow: "0 0 24px rgba(69,189,245,0.35)",
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px -15px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "aurora-text": "linear-gradient(100deg, #ffffff 0%, #b6e8ff 35%, #7fd6ff 55%, #a78bfa 100%)",
        "frost-line": "linear-gradient(90deg, transparent, rgba(127,214,255,0.5), transparent)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(-20%)" },
          "100%": { transform: "translateX(100%)" },
        },
        crystal: {
          "0%": { transform: "rotate(0deg) scale(0.9)", opacity: "0.7" },
          "50%": { transform: "rotate(180deg) scale(1.05)", opacity: "1" },
          "100%": { transform: "rotate(360deg) scale(0.9)", opacity: "0.7" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(69,189,245,0.35)" },
          "50%": { boxShadow: "0 0 0 8px rgba(69,189,245,0)" },
        },
        auroraShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        drawRing: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "var(--ring-offset, 0)" },
        },
        growBar: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        expand: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        shimmer: "shimmer 1.8s linear infinite",
        progress: "progress 1.4s ease-in-out infinite",
        crystal: "crystal 2.4s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.2s ease-out infinite",
        aurora: "auroraShift 10s ease infinite",
        "draw-ring": "drawRing 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        "grow-bar": "growBar 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        expand: "expand 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
