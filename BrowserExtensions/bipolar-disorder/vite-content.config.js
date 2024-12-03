import { defineConfig } from 'vite'

export default defineConfig({
  build:{
    emptyOutDir: false, // So that popup build files don't get deleted
    rollupOptions:{
      input:{
        content: "./src/content_script/content.js",
        styles: "./src/content_script/content.css", 
      },
      output:{
        entryFileNames: "Extension/content_script/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'Extension/content_script/content.css'; // Output CSS files here
          }
        }
      }
    },
  },
})