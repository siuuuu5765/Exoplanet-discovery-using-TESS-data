import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // In a Vercel environment, the API_KEY will be available in process.env
  // during the build step.
  const apiKey = process.env.API_KEY;

  return {
    plugins: [react()],
    // This 'define' block is the "bridge". It makes the environment variable
    // securely available in the client-side code under `process.env.API_KEY`.
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});