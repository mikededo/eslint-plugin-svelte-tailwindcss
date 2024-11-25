import type { Linter } from 'eslint';

export default [
  {
    name: 'svelte-tailwindcss:base',
    plugins: {
      get 'svelte-tailwindcss'() {
        // eslint-disable-next-line ts/no-require-imports
        return require('../index');
      }
    }
  },
  {
    files: ['*.svelte', '**/*.svelte'],
    languageOptions: {
      // eslint-disable-next-line ts/no-require-imports
      parser: require('svelte-eslint-parser')
    },
    name: 'svelte-tailwindcss:base:svelte-setup',
    processor: 'svelte/svelte'
  }
] satisfies Linter.Config[];
