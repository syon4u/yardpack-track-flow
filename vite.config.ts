import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detect Lovable preview environment and set appropriate base path
  const isLovablePreview = process.env.NODE_ENV === 'production' && 
    (process.env.CF_PAGES === '1' || process.env.VERCEL === '1');
  
  // Use relative paths in production to handle dynamic preview URLs
  const base = isLovablePreview ? './' : '/';
  
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
