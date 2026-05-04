import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const staticDirectories = ["photos", "chatbot"];

function copyStaticDirectories() {
  return {
    name: "copy-static-directories",
    writeBundle(outputOptions) {
      const outDir = outputOptions.dir || resolve(__dirname, "dist");
      for (const directory of staticDirectories) {
        const source = resolve(__dirname, directory);
        if (!existsSync(source)) continue;
        const target = resolve(outDir, directory);
        mkdirSync(target, { recursive: true });
        cpSync(source, target, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  plugins: [copyStaticDirectories()],
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
        dashboard: resolve(__dirname, "dashboard/index.html"),
        faq: resolve(__dirname, "faq/index.html"),
        privacy: resolve(__dirname, "privacy/index.html")
      }
    }
  }
});

