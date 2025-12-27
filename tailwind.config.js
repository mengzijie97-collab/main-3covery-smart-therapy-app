module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        neutral: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--neutral-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        gray: {
          50: "hsl(var(--gray-50))",
          100: "hsl(var(--gray-100))",
          200: "hsl(var(--gray-200))",
          300: "hsl(var(--gray-300))",
          400: "hsl(var(--gray-400))",
          500: "hsl(var(--gray-500))",
          600: "hsl(var(--gray-600))",
          700: "hsl(var(--gray-700))",
          800: "hsl(var(--gray-800))",
          900: "hsl(var(--gray-900))",
        },
        hero: "hsl(var(--hero-text))",
        navbar: "hsl(var(--navbar-text))",
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, hsl(0, 0%, 98%) 0%, hsl(210, 20%, 96%) 100%)',
        'gradient-2': 'linear-gradient(145deg, hsl(215, 80%, 52%) 0%, hsl(195, 85%, 62%) 100%)',
        'button-border-gradient': 'linear-gradient(90deg, hsla(215, 95%, 65%, 0.8), hsla(195, 90%, 70%, 0.8))',
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "dot-blink": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "dot-blink": "dot-blink 1.4s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
}
