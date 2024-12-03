import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'Extension', // Main output directory for assets
    rollupOptions: {
      input: {
        assets: resolve(__dirname, './src'), // Specify src/assets as the entry point
      },
      output: {
        // Keep asset structure similar to src/assets in Extension
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(name ?? '')) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    emptyOutDir: true, // Clears Extension folder on each build
  },
});
