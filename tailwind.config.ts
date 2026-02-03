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
        'medical-blue': '#4A90E2',
        'soft-teal': '#5DD9C1',
        'medical-green': '#6BCF9C',
        'warning-amber': '#FFB84D',
        'danger-coral': '#FF6B6B',
      },
    },
  },
  plugins: [],
}
export default config
