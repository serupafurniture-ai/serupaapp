import type { Config } from "tailwindcss";

/**
 * Semua warna mengacu ke CSS variable di globals.css supaya tema
 * Terang / Gelap / Sistem cukup diatur dari satu tempat.
 */
const token = (name: string) => `var(--${name})`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: { DEFAULT: token("surface"), muted: token("surface-muted") },
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        ink: { DEFAULT: token("ink"), soft: token("ink-soft"), muted: token("ink-muted") },
        primary: { DEFAULT: token("primary"), soft: token("primary-soft"), on: token("on-primary") },
        accent: { DEFAULT: token("accent"), ink: token("accent-ink"), soft: token("accent-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft"), ink: token("danger-ink") },
        warning: { soft: token("warning-soft"), ink: token("warning-ink") },
        success: { DEFAULT: token("success"), soft: token("success-soft"), ink: token("success-ink") },
        info: { soft: token("info-soft"), ink: token("info-ink") },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { xl: "14px", "2xl": "18px", "3xl": "24px" },
      boxShadow: { float: "0 8px 20px rgba(31, 45, 77, 0.28)" },
      maxWidth: { app: "480px" },
    },
  },
  plugins: [],
};

export default config;
