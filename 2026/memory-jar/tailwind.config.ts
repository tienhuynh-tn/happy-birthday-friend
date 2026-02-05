import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        cream: "#FFF5E9",
        peach: "#FFD7C2",
        rose: "#F8B3B8",
        ink: "#3B2F2F",
        jar: "#E7F4FF",
        jarEdge: "#BBD6E8"
      },
      boxShadow: {
        soft: "0 12px 30px -12px rgba(59,47,47,0.35)",
        note: "0 8px 16px -8px rgba(59,47,47,0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        lid: {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "100%": { transform: "translateY(-22px) rotate(-12deg)" },
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        lid: "lid 500ms ease-out forwards",
      }
    },
  },
  plugins: [],
};

export default config;
