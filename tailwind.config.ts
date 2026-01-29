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
                background: "var(--background)",
                foreground: "var(--foreground)",
                gym: {
                    black: "#0f172a", // Slate 950 (Rich Dark Blue-Gray)
                    dark: "#1e293b",  // Slate 800 (Card Background)
                    gray: "#334155",  // Slate 700 (Borders/Secondary BG)
                    primary: "#6366f1", // Indigo 500 (Primary Action)
                    secondary: "#14b8a6", // Teal 500 (Success/Active)
                    accent: "#f59e0b", // Amber 500 (Highlights/Alerts)
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
