import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/**/index.ts'],
      include: ['src/{rules,utils}/**/*.ts'],
      provider: 'v8'
    },
    globals: true,
    reporters: 'dot'
  }
});
