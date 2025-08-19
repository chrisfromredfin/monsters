import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/setupTests.js',
        '**/*.test.js',
        '**/*.spec.js',
        '.svelte-kit/**',
        'build/**',
        'static/**'
      ]
    }
  },
  define: {
    // Fix for Svelte 5 in testing environment
    'import.meta.env.SSR': false
  }
});
