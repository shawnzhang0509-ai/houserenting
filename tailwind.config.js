/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom brand colors
        cream: "#FFF8F0",
        coral: "#FF6B6B",
        "coral-dark": "#E55A5A",
        "warm-gray": "#4A4A4A",
        "light-pink": "#FFE0E0",
        "soft-purple": "#C9B1FF",
        "light-blue": "#B5D8FF",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "cube-rotate": {
          "0%": { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(360deg) rotateY(720deg) rotateZ(360deg)" },
        },
        "cylinder-spin": {
          "0%": { transform: "translate(-50%, -50%) rotateX(-20deg) rotateY(0deg)" },
          "100%": { transform: "translate(-50%, -50%) rotateX(-20deg) rotateY(-360deg)" },
        },
        "channel-offset": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(8px, 4px)" },
          "50%": { transform: "translate(-6px, -4px)" },
          "75%": { transform: "translate(4px, -6px)" },
          "100%": { transform: "translate(0, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "cube-rotate": "cube-rotate 20s linear infinite",
        "cylinder-spin": "cylinder-spin 15s linear infinite",
        "channel-offset": "channel-offset 0.3s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}