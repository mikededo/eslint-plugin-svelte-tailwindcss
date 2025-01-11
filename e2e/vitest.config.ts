import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./e2e/**/*.test.ts'],
    setupFiles: ['./e2e/setup.ts']
  }
});
