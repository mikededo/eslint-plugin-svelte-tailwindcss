
import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

import rule from './rule';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parser: svelteParser,
    sourceType: 'module'
  }
});

const ERROR = { message: 'Using \'{{atRule}}\' requires setting style lang to postcss' };

tester.run('no-literal-mustache-mix', rule, {
  invalid: [
    {
      code: `<style lang="postcss">.foo { .foo { @apply px-8; } }</style>`,
      errors: [ERROR]
    }
  ],
  valid: [
    { code: '' }
  ]
});
