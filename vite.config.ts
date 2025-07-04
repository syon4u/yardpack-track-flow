import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use relative paths for all production builds to handle dynamic preview URLs
  // This works for Lovable preview, Vercel, Netlify, and other hosting platforms
  const base = mode === 'production' ? './' : '/';
  
  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
