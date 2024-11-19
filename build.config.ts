import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  externals: [
    '@typescript-eslint/scope-manager',
    '@typescript-eslint/utils',
    'eslint',
    'svelte-eslint-parser',
    'typescript'
  ],
  rollup: { emitCJS: true }
});
