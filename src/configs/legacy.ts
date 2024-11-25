import type { Linter } from 'eslint';

import rules from './rules';

export default {
  plugins: ['svelte-tailwindcss'],
  rules
} satisfies Linter.LegacyConfig;
