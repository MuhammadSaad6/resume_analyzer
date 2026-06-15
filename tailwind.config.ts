import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 50px rgba(15, 23, 42, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(56,189,248,0.25), transparent 32%), radial-gradient(circle at right, rgba(168,85,247,0.18), transparent 24%), linear-gradient(180deg, rgba(15,23,42,1), rgba(15,23,42,0.92))',
      },
    },
  },
  plugins: [],
};

export default config;
