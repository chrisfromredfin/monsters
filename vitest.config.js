import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.js'],
    globals: true
  },
  define: {
    // Fix for Svelte 5 in testing environment
    'import.meta.env.SSR': false
  }
});
