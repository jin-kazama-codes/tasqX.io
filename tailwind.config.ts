import { type Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Issue type colors
        task: "#4bade8",
        story: "#68bc3c",
        bug: "#e84c3c",
        epic: "#984ce4",
        inprogress: "#0854cc",
        done: "#08845c",
        todo: "#d4d4d8",

        // ── Modern Brand Palette ──────────────────────────────────────────
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // primary indigo
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },

        // ── Accent Gradients ─────────────────────────────────────────────
        accent: {
          violet: "#7c3aed",
          cyan:   "#06b6d4",
          teal:   "#14b8a6",
          rose:   "#f43f5e",
          amber:  "#f59e0b",
          lime:   "#84cc16",
        },

        // ── Surface / Background tokens (dark mode first-class) ──────────
        surface: {
          // Light
          "base-l":   "#ffffff",
          "raised-l": "#f8fafc",
          "overlay-l":"#f1f5f9",
          "border-l": "#e2e8f0",
          // Dark
          "base-d":    "#0b0f17",
          "raised-d":  "#111827",
          "overlay-d": "#1e293b",
          "border-d":  "#334155",
          "muted-d":   "#475569",
        },

        // ── Text ─────────────────────────────────────────────────────────
        ink: {
          "primary-l":   "#0f172a",
          "secondary-l": "#475569",
          "muted-l":     "#94a3b8",
          "primary-d":   "#f1f5f9",
          "secondary-d": "#94a3b8",
          "muted-d":     "#64748b",
        },

        // ── Legacy aliases (keep for backward-compat) ────────────────────
        header:      "#264653",
        button:      "#264653",
        buttonHover: "#023047",
        body:        "#5EDFFF",
        sidebar:     "#ECFCFF",
        sprint:      "#B2FCFF",

        dark: {
          0:  "#4379c5",
          10: "#5d87cc",
          20: "#7495d2",
          30: "#89a3d9",
          40: "#9db2df",
          50: "#b1c1e6",
        },
        darkSprint: {
          0:  "#121420",
          10: "#1e293b",
          20: "#0f172a",
          30: "#334155",
          40: "#475569",
          50: "#64748b",
        },
        darkButton: {
          0:  "#171d2e",
          10: "#1e293b",
          20: "#273248",
          30: "#3b4f6a",
          40: "#4e637f",
          50: "#617897",
        },
      },

      backgroundImage: {
        // Premium mesh gradient for auth page backgrounds
        "auth-mesh": "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(6,182,212,0.10) 0%, transparent 50%)",
        "auth-mesh-dark": "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.20) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(6,182,212,0.15) 0%, transparent 50%)",
        "brand-gradient": "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
        "glow-brand":     "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(124,58,237,0.5))",
        "custom-background": `
          linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, 
          #B2FCFF calc(40% + 1px), #B2FCFF 60%, 
          #3E64FF calc(60% + 1px), #3E64FF 72%, 
          #5EDFFF calc(72% + 1px), #5EDFFF 100%)
        `,
      },

      boxShadow: {
        "glass":     "0 4px 24px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.1)",
        "glass-dark":"0 4px 24px rgba(0,0,0,0.4),  inset 0 0 0 1px rgba(255,255,255,0.05)",
        "glow":      "0 0 20px rgba(99,102,241,0.35)",
        "glow-sm":   "0 0 10px rgba(99,102,241,0.25)",
        "card":      "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        "card-dark": "0 2px 8px rgba(0,0,0,0.3),  0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover":"0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(99,102,241,0.15)",
        "modal":     "0 20px 60px rgba(0,0,0,0.2)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      animation: {
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-up":   "slideUp 0.25s ease-out",
        "slide-down": "slideDown 0.25s ease-out",
        "scale-in":   "scaleIn 0.15s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "shimmer":    "shimmer 1.8s linear infinite",
      },

      keyframes: {
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:  { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        slideDown:{ from: { transform: "translateY(-8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        scaleIn:  { from: { transform: "scale(0.96)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        glowPulse:{ "0%, 100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        shimmer:  { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },

      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("tailwindcss-animate"),
  ],
} satisfies Config;
