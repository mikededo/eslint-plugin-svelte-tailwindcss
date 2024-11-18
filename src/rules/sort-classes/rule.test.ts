import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

import rule from './rule';

const tester = new RuleTester({
  languageOptions: {
    parser: svelteParser,
    ecmaVersion: 2021,
    sourceType: 'module'
  }
});

const errors = [{ message: 'TailwindCSS classes should be sorted' }];
const unorderedClasses = 'px-8 py-4 text-white bg-blue-500';
const orderedClasses = 'bg-blue-500 px-8 py-4 text-white';

tester.run('sort-classes', rule, {
  invalid: [
    {
      code: `<div class="${unorderedClasses}"></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      errors
    },
    {
      code: `<div class:px-12={false} class="${unorderedClasses}"></div>`,
      output: `<div class:px-12={false} class="${orderedClasses}"></div>`,
      errors
    },
    {
      code: `<div class="${unorderedClasses}"></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      errors
    },
    {
      code: `<div class={"${unorderedClasses}"}></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      errors
    },
    {
      code: `<div class="{"${unorderedClasses}"}"></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      errors
    }
    // Not yet working
    // {
    //   code: `<div class={twMerge("${unorderedClasses}", variable)}></div>`,
    //   output: `<div class={twMerge("${orderedClasses}", variable)}></div>`,
    //   options: [{ callees: ['twMerge'] }],
    //   errors
    // },
    // {
    //   code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)}"></div>`,
    //   output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)}"></div>`,
    //   options: [{ callees: ['twMerge'] }],
    //   errors
    // }
  ],
  valid: [
    { code: `<div class="foo"></div>` },
    { code: `<div class={clsx("${unorderedClasses}")}></div>`, options: [{ callees: ['twMerge'] }] }
  ]
});
