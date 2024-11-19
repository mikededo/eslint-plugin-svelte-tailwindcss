import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  externals: ['eslint', '@typescript-eslint/utils', '@typescript-eslint/scope-manager', 'svelte-eslint-parser'],
  rollup: { emitCJS: true }
});
