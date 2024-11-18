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

const getError = (
  opts: Pick<RuleTester.TestCaseError, 'column' | 'endColumn'>
): RuleTester.TestCaseError => ({ message: 'TailwindCSS classes should be sorted', ...opts });

const unorderedClasses = 'px-8 py-4 text-white bg-blue-500';
const orderedClasses = 'bg-blue-500 px-8 py-4 text-white';

tester.run('sort-classes', rule, {
  invalid: [
    {
      code: `<div class="${unorderedClasses}"></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 })]
    },
    {
      code: `<div class:px-12={false} class="${unorderedClasses}"></div>`,
      output: `<div class:px-12={false} class="${orderedClasses}"></div>`,
      errors: [getError({ column: 33, endColumn: unorderedClasses.length + 33 })]
    },
    {
      code: `<div class={"${unorderedClasses}"}></div>`,
      output: `<div class={"${orderedClasses}"}></div>`,
      // 16 is 12 plus the length of the {" and the "}
      errors: [getError({ column: 12, endColumn: unorderedClasses.length + 16 })]
    },
    {
      code: `<div class="{"${unorderedClasses}"}"></div>`,
      output: `<div class="{"${orderedClasses}"}"></div>`,
      // 17 is 13 plus the length of the {" and the "}
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 17 })]
    },
    {
      code: `<div class={twMerge("${unorderedClasses}", variable)}></div>`,
      output: `<div class={twMerge("${orderedClasses}", variable)}></div>`,
      options: [{ callees: ['twMerge'] }],
      errors: [getError({ column: 21, endColumn: unorderedClasses.length + 23 })]
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)}"></div>`,
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)}"></div>`,
      options: [{ callees: ['twMerge'] }],
      errors: [
        // + 1 for the extra space which is considered part of the SvelteLiteral
        getError({ column: 13, endColumn: unorderedClasses.length + 13 + 1 }),
        getError({ column: 55, endColumn: unorderedClasses.length + 57 })
      ]
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)} ${unorderedClasses}"></div>`,
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)} ${orderedClasses}"></div>`,
      options: [{ callees: ['twMerge'], removeDuplicates: false }],
      errors: [
        // + 1 for the extra space which is considered part of the SvelteLiteral
        getError({ column: 13, endColumn: unorderedClasses.length + 14 }),
        getError({ column: 55, endColumn: unorderedClasses.length + 57 }),
        getError({ column: 101, endColumn: unorderedClasses.length + 102 })
      ]
    },
    // Specific options
    // removeDuplicates
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      output: `<div class="${orderedClasses}"></div>`,
      options: [{ removeDuplicates: true }],
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 + 'bg-blue-500 '.length })]
    },
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      output: `<div class="bg-blue-500 ${orderedClasses}"></div>`,
      options: [{ removeDuplicates: false }],
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 + 'bg-blue-500 '.length })]
    }
  ],
  valid: [
    { code: `<div class="foo"></div>` }
    // { code: `<div class={clsx("${unorderedClasses}")}></div>`, options: [{ callees: ['twMerge'] }] }
  ]
});
