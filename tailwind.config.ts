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
                    black: "#0a0a0a",
                    dark: "#171717",
                    gray: "#262626",
                    primary: "#ccff00", // Neon Lime
                    secondary: "#00ccff", // Cyan
                    accent: "#ff0055", // Pink/Red
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
