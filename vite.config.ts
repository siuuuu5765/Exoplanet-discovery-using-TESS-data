import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// FIX: Import `fileURLToPath` to resolve the project root path from `import.meta.url`.
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars from the Vercel environment
  // FIX: Replace `process.cwd()` with an ESM-compatible way to get the root directory.
  // This resolves the TypeScript error "Property 'cwd' does not exist on type 'Process'".
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');

  return {
    plugins: [react()],
    // This 'define' block is the fix. It makes the environment variable
    // available in the client-side code.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
