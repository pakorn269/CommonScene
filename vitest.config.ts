import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@commonscene/catalog': fileURLToPath(
        new URL('./packages/catalog/src/index.ts', import.meta.url),
      ),
      '@commonscene/consensus': fileURLToPath(
        new URL('./packages/consensus/src/index.ts', import.meta.url),
      ),
      '@commonscene/contracts': fileURLToPath(
        new URL('./packages/contracts/src/index.ts', import.meta.url),
      ),
      '@commonscene/test-fixtures': fileURLToPath(
        new URL('./packages/test-fixtures/src/index.ts', import.meta.url),
      ),
      '@commonscene/ui-tokens': fileURLToPath(
        new URL('./packages/ui-tokens/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    // Find tests in all workspace packages
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.spec.ts',
      'services/*/src/**/*.test.ts',
      'services/*/src/**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      // E2E tests are run separately via Playwright
      '**/e2e/**',
    ],
    // Provide helpful output
    reporters: ['verbose'],
    // Coverage via v8
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts', 'services/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts', '**/types.ts'],
      thresholds: {
        // Raised to 90% in Phase 3 for consensus package
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
    // Enable TypeScript path resolution
    typecheck: {
      enabled: false,
    },
  },
});
