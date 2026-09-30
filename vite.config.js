import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  // imagetools makes the card pictures at several widths at build time,
  // from an import like `picture.webp?w=1280;1920;2560&format=webp&as=srcset`
  // (see src/data/projects.js)
  plugins: [react(), svgr(), imagetools()],
});
