import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index', 'src/workers/config-v4.ts'],
  externals: [
    '@typescript-eslint/scope-manager',
    '@typescript-eslint/utils',
    '@typescript-eslint/types',
    'eslint',
    'svelte-eslint-parser',
    'tailwindcss',
    'typescript'
  ],
  rollup: {
    emitCJS: true
  }
});

