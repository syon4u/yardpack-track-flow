import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detect base path for Lovable preview environment
  const getBasePath = () => {
    if (process.env.NODE_ENV === 'development' && process.env.LOVABLE_PREVIEW) {
      return '/projects/05edb5eb-bd65-4211-b7e5-faa8ef3c05a1/yardpack-track-flow/';
    }
    return '/';
  };

  return {
    base: getBasePath(),
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
