import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    base: './',
    server: {
      host: "::",
      port: 8080,
      headers: {
        "Content-Security-Policy": "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https: data:; " +
          "img-src 'self' data: blob: https:; " +
          "media-src 'self' data: blob: https:; " +
          "connect-src 'self' https://qlkkzxktybgthjcwhrfd.supabase.co https://*.supabase.co; " +
          "frame-src 'self' https://*.supabase.co;"
      },
      // Ensure static files are served with the correct MIME types
      fs: {
        strict: false
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Configure static asset handling
    assetsInclude: ['**/*.lottie', '**/*.json'],
    
    build: {
      target: 'esnext',
      // Ensure static assets are copied to the build output
      assetsInlineLimit: 0,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
            utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
            charts: ['recharts'],
            animations: ['lottie-react']
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development',
      cssCodeSplit: true,
      treeshake: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      'process.env': env
    },
    envPrefix: 'VITE_'
  };
});
