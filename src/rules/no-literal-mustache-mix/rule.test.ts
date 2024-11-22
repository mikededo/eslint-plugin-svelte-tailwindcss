import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

import rule from './rule';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2021,
    parser: svelteParser,
    sourceType: 'module'
  }
});

const ERROR = { message: 'Do not mix literal expressions with mustache expressions' };

tester.run('no-literal-mustache-mix', rule, {
  invalid: [
    {
      code: `<div class="foo {bar} foor"></div>`,
      errors: [ERROR],
      output: `<div class="foo foor {bar}"></div>`
    },
    {
      code: `<div class="foo {twMerge('foo bar', variable)} foor"></div>`,
      errors: [ERROR],
      output: `<div class="foo foor {twMerge('foo bar', variable)}"></div>`
    },
    {
      code: `<div class="{twMerge('foo bar', variable)} foo foor {twMerge('foo bar', variable)}"></div>`,
      errors: [ERROR],
      output: `<div class="{twMerge('foo bar', variable)} {twMerge('foo bar', variable)} foo foor"></div>`
    },
    {
      code: `<div class="foo {twMerge('foo bar', variable)} {twMerge('foo bar', variable)} foor"></div>`,
      errors: [ERROR],
      output: `<div class="foo foor {twMerge('foo bar', variable)} {twMerge('foo bar', variable)}"></div>`
    }
  ],
  valid: [
    { code: `<div class="foo"></div>` },
    { code: `<div class="foo oof {twMerge('foo bar', variable)}"></div>` },
    { code: `<div class={twMerge('foo bar', variable)}></div>` },
    { code: `<div class=""></div>` },
    { code: `<div klass=""></div>` }
  ]
});
