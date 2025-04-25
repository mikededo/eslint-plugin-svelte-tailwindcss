import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: { MODE: 'e2e-test' },
    environment: 'node',
    globals: true,
    include: ['run.test.ts']
  }
});
