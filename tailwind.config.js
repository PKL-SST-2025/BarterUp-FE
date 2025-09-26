// tailwind.config.js
import plugin from 'flowbite/plugin';
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Consistent BarterUp Brand Colors
        'primary': '#4CE0D2',
        'primary-dark': '#36C9B9', 
        'primary-light': '#7EE8DD',
        'secondary': '#FF6B6B',
        'secondary-dark': '#FF5252',
        'accent': '#FFE66D',
        'accent-dark': '#FFD93D',
        
        // Background Colors
        'bg-dark': '#0F2027',
        'bg-darker': '#203A43',
        'bg-darkest': '#2C5364',
        
        // Consistent Glass Colors
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-strong': 'rgba(255, 255, 255, 0.15)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4CE0D2 0%, #36C9B9 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%)',
        'gradient-bg': 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        'gradient-text': 'linear-gradient(135deg, #4CE0D2 0%, #FF6B6B 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'exchange': 'exchangeRotate 10s linear infinite',
        'exchange-hover': 'exchangeRotate 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
    },
  },
  plugins: [plugin, require('flowbite/plugin')],
});
