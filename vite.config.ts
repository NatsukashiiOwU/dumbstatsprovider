import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wyw from '@wyw-in-js/vite';
import linaria from '@linaria/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wyw({
      include: ['**/*.{js,ts,jsx,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
      },
    }),
    react(),
    linaria({
      include: ['**/*.{js,ts,jsx,tsx}'],
    }),
  ],
  assetsInclude: ['**/*.otf'],
})
