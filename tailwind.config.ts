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
        primary: '#000000',
        'primary-light': 'rgba(0,0,0,0.06)',
        'surface': '#FFFFFF',
        'surface-secondary': '#F5F5F5',
        'bg': '#FAFAFA',
        'text-primary': '#111111',
        'text-secondary': '#666666',
        'text-tertiary': '#999999',
        'border': '#E8E8E8',
        'border-light': '#F0F0F0',
        // 상태색 - 채도 낮춘 모노크롬 톤
        'status-pending': '#B8860B',
        'status-active': '#333333',
        'status-complete': '#2D8A4E',
        'status-urgent': '#CC3333',
        'status-cancel': '#999999',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'SF Pro Display',
          'SF Pro Text',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'nav': '0 -1px 0 rgba(0,0,0,0.06)',
        'elevated': '0 8px 30px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'micro': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
export default config;
