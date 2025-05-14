import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

// CHANGE THIS to your actual GitHub repo name
const repoName = "azure-DevOps-workItemCreator"

export default defineConfig(({ mode }) => ({
  base: `/${repoName}/`, // 👈 This is what you need for GitHub Pages
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
