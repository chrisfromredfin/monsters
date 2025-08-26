import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.js'],
    globals: true,
    // Only include src directory for unit/integration tests
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/**'], // Exclude Playwright E2E tests
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
        'static/**',
        'tests/**', // Exclude Playwright E2E tests
        // Exclude Svelte components - better tested with E2E
        '**/*.svelte',
        // Exclude config files
        '*.config.js',
        '*.config.ts',
        // Exclude type definitions
        '**/*.d.ts',
        // Exclude app.d.ts and other generated files
        'src/app.d.ts'
      ],
      // Focus coverage on what we should actually unit test
      include: [
        'src/lib/utils/**',
        'src/lib/stores/**',
        'src/lib/*-helpers.js',
        'src/lib/constants.js'
      ]
    }
  },
  define: {
    // Fix for Svelte 5 in testing environment
    'import.meta.env.SSR': false
  }
});
