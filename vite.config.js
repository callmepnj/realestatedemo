import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        projects: resolve(__dirname, "projects/index.html"),
        villas: resolve(__dirname, "villas/index.html"),
        investor: resolve(__dirname, "investor/index.html"),
        nri: resolve(__dirname, "nri/index.html"),
        gallery: resolve(__dirname, "gallery/index.html"),
        blogs: resolve(__dirname, "blogs/index.html"),
        contact: resolve(__dirname, "contact/index.html"),
        dashboard: resolve(__dirname, "dashboard/index.html")
      }
    }
  }
});
