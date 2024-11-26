import type { Linter } from 'eslint';

import svelteParser from 'svelte-eslint-parser';

import plugin from '../index';
import rules from './rules';

export default [
  {
    name: 'svelte-tailwindcss:base',
    plugins: {
      get 'svelte-tailwindcss'() {
        return plugin;
      }
    }
  },
  {
    files: ['*.svelte', '**/*.svelte'],
    languageOptions: {
      parser: svelteParser
    },
    name: 'svelte-tailwindcss:base:svelte-setup',
    processor: 'svelte/svelte',
    rules
  }
] satisfies Linter.Config[];
