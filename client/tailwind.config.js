/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bgLight: "#f9fafb",
                bgDark: "#0f172a",
                cardDark: "#1e293b",
                textLight: "#1f2937",
                textDark: "#f1f5f9"
            }
        },
    },
    plugins: [],
}