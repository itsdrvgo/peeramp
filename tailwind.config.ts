import { nextui } from "@nextui-org/react";
import { withUt } from "uploadthing/tw";

export default withUt({
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                light: {
                    accent: "var(--light-accent)",
                },
                dark: {
                    accent: "var(--dark-accent)",
                },
            },
            boxShadow: {
                "dark-glow": "0 0 600px 300px var(--dark-glow)",
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        nextui({
            prefix: "peeramp",
            themes: {
                light: {
                    colors: {
                        background: "hsl(0, 0%, 100%)",
                        primary: {
                            DEFAULT: "hsl(240, 47%, 33%)",
                            "50": "hsl(240, 47%, 13%)",
                            "100": "hsl(240, 47%, 23%)",
                            "200": "hsl(240, 47%, 33%)",
                            "300": "hsl(240, 47%, 43%)",
                            "400": "hsl(240, 47%, 53%)",
                            "500": "hsl(240, 47%, 63%)",
                            "600": "hsl(240, 47%, 73%)",
                            "700": "hsl(240, 47%, 83%)",
                            "800": "hsl(240, 47%, 93%)",
                            "900": "hsl(240, 47%, 100%)",
                            foreground: "hsl(240, 47%, 100%)",
                        },
                        secondary: {
                            DEFAULT: "hsl(240, 55%, 45%)",
                            "50": "hsl(240, 55%, 15%)",
                            "100": "hsl(240, 55%, 25%)",
                            "200": "hsl(240, 55%, 35%)",
                            "300": "hsl(240, 55%, 45%)",
                            "400": "hsl(240, 55%, 55%)",
                            "500": "hsl(240, 55%, 65%)",
                            "600": "hsl(240, 55%, 75%)",
                            "700": "hsl(240, 55%, 85%)",
                            "800": "hsl(240, 55%, 95%)",
                            "900": "hsl(240, 55%, 100%)",
                            foreground: "hsl(240, 55%, 100%)",
                        },
                        danger: {
                            DEFAULT: "hsl(0, 75%, 31%)",
                            "50": "hsl(0, 75%, 11%)",
                            "100": "hsl(0, 75%, 21%)",
                            "200": "hsl(0, 75%, 31%)",
                            "300": "hsl(0, 75%, 41%)",
                            "400": "hsl(0, 75%, 51%)",
                            "500": "hsl(0, 75%, 61%)",
                            "600": "hsl(0, 75%, 71%)",
                            "700": "hsl(0, 75%, 81%)",
                            "800": "hsl(0, 75%, 91%)",
                            "900": "hsl(0, 75%, 100%)",
                            foreground: "hsl(0, 75%, 100%)",
                        },
                        foreground: "hsl(0, 0%, 0%)",
                    },
                },
                dark: {
                    colors: {
                        background: "hsl(0, 12%, 6%)",
                        primary: {
                            DEFAULT: "hsl(240, 66%, 85%)",
                            "50": "hsl(240, 66%, 15%)",
                            "100": "hsl(240, 66%, 25%)",
                            "200": "hsl(240, 66%, 35%)",
                            "300": "hsl(240, 66%, 45%)",
                            "400": "hsl(240, 66%, 55%)",
                            "500": "hsl(240, 66%, 65%)",
                            "600": "hsl(240, 66%, 75%)",
                            "700": "hsl(240, 66%, 85%)",
                            "800": "hsl(240, 66%, 95%)",
                            "900": "hsl(240, 66%, 100%)",
                        },
                        secondary: {
                            DEFAULT: "hsl(240, 36%, 29%)",
                            "50": "hsl(240, 36%, 9%)",
                            "100": "hsl(240, 36%, 19%)",
                            "200": "hsl(240, 36%, 29%)",
                            "300": "hsl(240, 36%, 39%)",
                            "400": "hsl(240, 36%, 49%)",
                            "500": "hsl(240, 36%, 59%)",
                            "600": "hsl(240, 36%, 69%)",
                            "700": "hsl(240, 36%, 79%)",
                            "800": "hsl(240, 36%, 89%)",
                            "900": "hsl(240, 36%, 100%)",
                            foreground: "hsl(240, 36%, 100%)",
                        },
                        danger: {
                            DEFAULT: "hsl(0, 68%, 37%)",
                            "50": "hsl(0, 68%, 17%)",
                            "100": "hsl(0, 68%, 27%)",
                            "200": "hsl(0, 68%, 37%)",
                            "300": "hsl(0, 68%, 47%)",
                            "400": "hsl(0, 68%, 57%)",
                            "500": "hsl(0, 68%, 67%)",
                            "600": "hsl(0, 68%, 77%)",
                            "700": "hsl(0, 68%, 87%)",
                            "800": "hsl(0, 68%, 97%)",
                            "900": "hsl(0, 68%, 100%)",
                            foreground: "hsl(0, 68%, 100%)",
                        },
                        foreground: "hsl(0, 0%, 100%)",
                    },
                },
            },
        }),
    ],
});
