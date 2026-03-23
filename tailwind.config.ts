import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        'primary-light': '#007AFF1A',
        'ios-bg': '#F2F2F7',
        'ios-text': '#1C1C1E',
        'ios-subtext': '#8E8E93',
        'ios-separator': '#C6C6C8',
        'status-pending': '#FF9500',
        'status-active': '#007AFF',
        'status-complete': '#34C759',
        'status-urgent': '#FF3B30',
        'status-cancel': '#8E8E93',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 15px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 25px rgba(0,0,0,0.1)',
        'nav': '0 -1px 10px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
export default config;
