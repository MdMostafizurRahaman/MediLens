import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F8FAFC',
        foreground: '#1E293B',
      },
      fontFamily: {
        'bangla': ['Kalpurush', 'SolaimanLipi', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        medilens: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          neutral: '#374151',
          'base-100': '#FFFFFF',
          'base-200': '#F8FAFC',
          'base-300': '#E5E7EB',
          info: '#0EA5E9',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
    ],
  },
}

export default config
