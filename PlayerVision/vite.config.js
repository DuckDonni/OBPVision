import { defineConfig } from "vite";
import { copyFileSync } from "fs";
import { join } from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure staticwebapp.config.json is copied
      }
    }
  },
  plugins: [
    {
      name: 'copy-staticwebapp-config',
      closeBundle() {
        copyFileSync(
          join(process.cwd(), 'staticwebapp.config.json'),
          join(process.cwd(), 'dist', 'staticwebapp.config.json')
        );
      }
    }
  ]
});