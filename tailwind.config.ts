import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cafe-espresso':  '#000000',
        'cafe-tostado':   '#af4c0f',
        'cafe-latte':     '#C4956A',
        'cafe-crema':     '#f8f4ec',
        'cafe-vapor':     '#EEE8E0',
        'alerta-critica': '#DC2626',
        'alerta-baja':    '#F59E0B',
        'disponible':     '#16A34A',
        'no-disponible':  '#9CA3AF',
      },
    },
  },
  plugins: [],
} satisfies Config
