import type { Config } from "tailwindcss";

/**
 * Tailwind configuration for the HRMS design system.
 *
 * Colors use the `hsl(var(--token) / <alpha-value>)` pattern so every semantic
 * color supports opacity modifiers (e.g. `bg-primary/90`, `bg-success/10`).
 * Tokens are defined once in `src/app/globals.css`. Shadows are intentionally
 * soft (no heavy elevation); radii default to 12px.
 */
const hsl = (token: string) => `hsl(var(--${token}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        canvas: hsl("canvas"),
        foreground: hsl("foreground"),
        "subtle-foreground": hsl("subtle-foreground"),
        primary: {
          DEFAULT: hsl("primary"),
          hover: hsl("primary-hover"),
          foreground: hsl("primary-foreground"),
        },
        secondary: {
          DEFAULT: hsl("secondary"),
          foreground: hsl("secondary-foreground"),
        },
        destructive: {
          DEFAULT: hsl("destructive"),
          foreground: hsl("destructive-foreground"),
        },
        success: {
          DEFAULT: hsl("success"),
          foreground: hsl("success-foreground"),
        },
        warning: {
          DEFAULT: hsl("warning"),
          foreground: hsl("warning-foreground"),
        },
        info: {
          DEFAULT: hsl("info"),
          foreground: hsl("info-foreground"),
        },
        muted: {
          DEFAULT: hsl("muted"),
          foreground: hsl("muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("accent"),
          foreground: hsl("accent-foreground"),
        },
        popover: {
          DEFAULT: hsl("popover"),
          foreground: hsl("popover-foreground"),
        },
        card: {
          DEFAULT: hsl("card"),
          foreground: hsl("card-foreground"),
        },
        sidebar: {
          DEFAULT: hsl("sidebar-background"),
          foreground: hsl("sidebar-foreground"),
          accent: hsl("sidebar-accent"),
          "accent-foreground": hsl("sidebar-accent-foreground"),
          muted: hsl("sidebar-muted"),
          border: hsl("sidebar-border"),
          ring: hsl("sidebar-ring"),
        },
      },
      borderRadius: {
        xl: "var(--radius)" /* 12px */,
        lg: "calc(var(--radius) - 2px)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        /* Calm, non-oversized scale. */
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }] /* 15px body */,
        md: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.6rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }] /* 24px titles */,
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2rem", { lineHeight: "2.4rem" }],
      },
      spacing: {
        sidebar: "16.25rem" /* 260px */,
        "sidebar-collapsed": "4.5rem" /* 72px */,
        header: "4.5rem" /* 72px */,
      },
      boxShadow: {
        /* Soft only — no heavy elevation. */
        xs: "0 1px 2px 0 rgb(16 24 40 / 0.04)",
        soft: "0 1px 2px 0 rgb(16 24 40 / 0.05), 0 1px 3px 0 rgb(16 24 40 / 0.04)",
        card: "0 1px 2px 0 rgb(16 24 40 / 0.05)",
        popover:
          "0 4px 12px -2px rgb(16 24 40 / 0.08), 0 2px 6px -2px rgb(16 24 40 / 0.05)",
        overlay:
          "0 16px 40px -8px rgb(16 24 40 / 0.16), 0 4px 12px -4px rgb(16 24 40 / 0.08)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
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
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
