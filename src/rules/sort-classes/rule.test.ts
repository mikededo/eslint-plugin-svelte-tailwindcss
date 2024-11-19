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

const getError = (
  opts: Pick<RuleTester.TestCaseError, 'column' | 'endColumn'>
): RuleTester.TestCaseError => ({ message: 'TailwindCSS classes should be sorted', ...opts });

const unorderedClasses = 'px-8 py-4 text-white bg-blue-500';
const orderedClasses = 'bg-blue-500 px-8 py-4 text-white';

tester.run('sort-classes', rule, {
  invalid: [
    {
      code: `<div class="${unorderedClasses}"></div>`,
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 })],
      output: `<div class="${orderedClasses}"></div>`
    },
    {
      code: `<div class:px-12={false} class="${unorderedClasses}"></div>`,
      errors: [getError({ column: 33, endColumn: unorderedClasses.length + 33 })],
      output: `<div class:px-12={false} class="${orderedClasses}"></div>`
    },
    {
      code: `<div class={"${unorderedClasses}"}></div>`,
      // 16 is 12 plus the length of the {" and the "}
      errors: [getError({ column: 12, endColumn: unorderedClasses.length + 16 })],
      output: `<div class={"${orderedClasses}"}></div>`
    },
    {
      code: `<div class="{"${unorderedClasses}"}"></div>`,
      // 17 is 13 plus the length of the {" and the "}
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 17 })],
      output: `<div class="{"${orderedClasses}"}"></div>`
    },
    {
      code: `<div class={twMerge("${unorderedClasses}", variable)}></div>`,
      errors: [getError({ column: 21, endColumn: unorderedClasses.length + 23 })],
      options: [{ callees: ['twMerge'] }],
      output: `<div class={twMerge("${orderedClasses}", variable)}></div>`
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)}"></div>`,
      errors: [
        // + 1 for the extra space which is considered part of the SvelteLiteral
        getError({ column: 13, endColumn: unorderedClasses.length + 13 + 1 }),
        getError({ column: 55, endColumn: unorderedClasses.length + 57 })
      ],
      options: [{ callees: ['twMerge'] }],
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)}"></div>`
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)} ${unorderedClasses}"></div>`,
      errors: [
        // + 1 for the extra space which is considered part of the SvelteLiteral
        getError({ column: 13, endColumn: unorderedClasses.length + 14 }),
        getError({ column: 55, endColumn: unorderedClasses.length + 57 }),
        getError({ column: 101, endColumn: unorderedClasses.length + 102 })
      ],
      options: [{ callees: ['twMerge'], removeDuplicates: false }],
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)} ${orderedClasses}"></div>`
    },
    // Specific options
    // removeDuplicates
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 + 'bg-blue-500 '.length })],
      options: [{ removeDuplicates: true }],
      output: `<div class="${orderedClasses}"></div>`
    },
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      errors: [getError({ column: 13, endColumn: unorderedClasses.length + 13 + 'bg-blue-500 '.length })],
      options: [{ removeDuplicates: false }],
      output: `<div class="bg-blue-500 ${orderedClasses}"></div>`
    }
  ],
  valid: [
    { code: `<div class="foo"></div>` },
    { code: `<div class={clsx("${unorderedClasses}")}></div>`, options: [{ callees: ['twMerge'] }] }
  ]
});
