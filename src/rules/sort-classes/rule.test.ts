import type { ExpectedFileType } from '../../utils';
import type * as Rule from './rule';

import type { InvalidTestCase, TestCaseError } from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';
import svelteParser from 'svelte-eslint-parser';

import { EXPECTED_FILE_TYPES } from '../../utils';
import rule from './rule';

const tester = new RuleTester({
  defaultFilenames: {
    ts: 'component.svelte',
    tsx: 'component.svelte'
  },
  languageOptions: {
    ecmaVersion: 2020,
    parser: svelteParser,
    sourceType: 'module'
  }
});

const getError = (
  opts: Pick<TestCaseError<Rule.MessageIds>, 'column' | 'endColumn'> = {}
): TestCaseError<Rule.MessageIds> => ({
  messageId: 'sort-classes',
  ...opts
});

const unorderedClasses = 'px-8 py-4 text-white bg-blue-500';
const nlUnorderedClasses = unorderedClasses.replaceAll(' ', '\n');
const orderedClasses = 'bg-blue-500 px-8 py-4 text-white';
const nlOrderedClasses = orderedClasses.replaceAll(' ', '\n');

const getCallExpressionTests = (ext: ExpectedFileType): InvalidTestCase<Rule.MessageIds, Rule.OptionList>[] =>
  [
    {
      code: `const classes = twMerge("${unorderedClasses}");`,
      errors: [getError()],
      options: [{ callees: ['twMerge'] }],
      output: `const classes = twMerge("${orderedClasses}");`
    },
    {
      code: `const v = twMerge({ '${unorderedClasses}': true });`,
      errors: [getError()],
      options: [{ callees: ['twMerge'] }],
      output: `const v = twMerge({ '${orderedClasses}': true });`
    },
    {
      code: `const v = clsx({ true: '${unorderedClasses}' });`,
      errors: [getError()],
      options: [{ callees: ['clsx'] }],
      output: `const v = clsx({ true: '${orderedClasses}' });`
    },
    {
      code: `const v = ctl(\`${nlUnorderedClasses}\`);`,
      errors: [getError()],
      options: [{ callees: ['ctl'] }],
      output: `const v = ctl(\`${nlOrderedClasses}\`);`
    },
    {
      code: `const v = ctl(\`\${enabled && "${unorderedClasses}"}\`)`,
      errors: [getError()],
      output: `const v = ctl(\`\${enabled && "${orderedClasses}"}\`)`
    },
    {
      code: `const v = ctl(\`\${enabled ? "${unorderedClasses}" : "${unorderedClasses}"}\`)`,
      errors: [getError(), getError()],
      output: `const v = ctl(\`\${enabled ? "${orderedClasses}" : "${orderedClasses}"}\`)`
    },
    {
      code: `
const c = ctl(\`
  ${nlUnorderedClasses}
  \${
    !isDisabled &&
    \`
      ${nlOrderedClasses}
    \`
  }
  \${
    isDisabled &&
    \`
      ${nlUnorderedClasses}
    \`
  }
\`)
`,
      errors: [getError(), getError()],
      options: [{ callees: ['ctl'] }],
      output: `
const c = ctl(\`
  ${nlOrderedClasses}
  \${
    !isDisabled &&
    \`
      ${nlOrderedClasses}
    \`
  }
  \${
    isDisabled &&
    \`
      ${nlOrderedClasses}
    \`
  }
\`)
`
    },
    {
      code: `const v = cva({ primary: ["${unorderedClasses}"], })`,
      errors: [getError()],
      options: [{ callees: ['cva'] }],
      output: `const v = cva({ primary: ["${orderedClasses}"], })`
    },
    {
      code: `const nested = cva({ primary: { small: ["${unorderedClasses}"], default: ["${orderedClasses}"] } })`,
      errors: [getError()],
      options: [{ callees: ['cva'] }],
      output: `const nested = cva({ primary: { small: ["${orderedClasses}"], default: ["${orderedClasses}"] } })`
    }
  ].map((test) => ({ ...test, filename: `file${ext}` }));

const getDeclarationTests = (ext: ExpectedFileType): InvalidTestCase<Rule.MessageIds, Rule.OptionList>[] =>
  [
    {
      code: `function fn() { const classVariants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { prefix: ['class'] } }],
      output: `function fn() { const classVariants = '${orderedClasses}'; }`
    },
    {
      code: `const fn = () => { const classVariants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { prefix: ['class'] } }],
      output: `const fn = () => { const classVariants = '${orderedClasses}'; }`
    },
    {
      code: `function name() { const classVariants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { suffix: ['Variants'] } }],
      output: `function name() { const classVariants = '${orderedClasses}'; }`
    },
    {
      code: `const name = () => { let classVariants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { suffix: ['Variants'] } }],
      output: `const name = () => { let classVariants = '${orderedClasses}'; }`
    },
    {
      code: `function name() { let variants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { names: ['variants'] } }],
      output: `function name() { let variants = '${orderedClasses}'; }`
    },
    {
      code: `const name = () => { const variants = '${unorderedClasses}'; }`,
      errors: [getError()],
      options: [{ declarations: { names: ['variants'] } }],
      output: `const name = () => { const variants = '${orderedClasses}'; }`
    },
    {
      code: `const check = '${unorderedClasses}', nocheck = '${unorderedClasses}';`,
      errors: [getError()],
      options: [{ declarations: { prefix: ['check'] } }],
      output: `const check = '${orderedClasses}', nocheck = '${unorderedClasses}';`
    },
    {
      code: `const variants = { prop: '${unorderedClasses}' };`,
      errors: [getError()],
      options: [{ declarations: { names: ['variants'] } }],
      output: `const variants = { prop: '${orderedClasses}' };`
    }
  ].map((test) => ({ ...test, filename: `file${ext}` }));

tester.run('sort-classes', rule as any, {
  invalid: [
    {
      code: `<div class="${unorderedClasses}"></div>`,
      errors: [getError()],
      output: `<div class="${orderedClasses}"></div>`
    },
    {
      code: `<div class:px-12={false} class="${unorderedClasses}"></div>`,
      errors: [getError()],
      output: `<div class:px-12={false} class="${orderedClasses}"></div>`
    },
    {
      code: `<div class={"${unorderedClasses}"}></div>`,
      errors: [getError()],
      output: `<div class={"${orderedClasses}"}></div>`
    },
    {
      code: `<div class="{"${unorderedClasses}"}"></div>`,
      errors: [getError()],
      output: `<div class="{"${orderedClasses}"}"></div>`
    },
    {
      code: `<div class={twMerge("${unorderedClasses}", variable)}></div>`,
      errors: [getError()],
      options: [{ callees: ['twMerge'] }],
      output: `<div class={twMerge("${orderedClasses}", variable)}></div>`
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)}"></div>`,
      errors: [getError(), getError()],
      options: [{ callees: ['twMerge'] }],
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)}"></div>`
    },
    {
      code: `<div class="${unorderedClasses} {util.twMerge("${unorderedClasses}", variable)}"></div>`,
      errors: [getError(), getError()],
      options: [{ callees: ['util.twMerge'] }],
      output: `<div class="${orderedClasses} {util.twMerge("${orderedClasses}", variable)}"></div>`
    },
    {
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)} ${unorderedClasses}"></div>`,
      errors: [getError(), getError(), getError()],
      options: [{ callees: ['twMerge'], removeDuplicates: false }],
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)} ${orderedClasses}"></div>`
    },
    {
      code: `<script>
const multipleSpaces = twMerge("${unorderedClasses.replaceAll(' ', '   ')} ");
</script>`,
      errors: [getError()],
      options: [{ callees: ['twMerge'] }],
      output: `<script>
const multipleSpaces = twMerge("${orderedClasses.replaceAll(' ', '   ')} ");
</script>`
    },

    // Specific options
    // removeDuplicates
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      errors: [getError()],
      options: [{ removeDuplicates: true }],
      output: `<div class="${orderedClasses}"></div>`
    },
    {
      code: `<div class="${unorderedClasses} bg-blue-500"></div>`,
      errors: [getError()],
      options: [{ removeDuplicates: false }],
      output: `<div class="bg-blue-500 ${orderedClasses}"></div>`
    },
    {
      code: `<div class="\n${nlUnorderedClasses}\n"></div>`,
      errors: [getError()],
      output: `<div class="\n${nlOrderedClasses}\n"></div>`
    },

    // Config
    {
      code: `<div class="${unorderedClasses.split(' ').map((c) => `ui-${c}`).join(' ')}"></div>`,
      errors: [getError()],
      options: [{ config: { prefix: 'ui-' } }],
      output: `<div class="${orderedClasses.split(' ').map((c) => `ui-${c}`).join(' ')}"></div>`
    },

    // CallExpression on Svelte files
    ...getCallExpressionTests('.svelte').map((test) => ({
      ...test,
      code: `<script>\n${test.code}\n</script>`,
      output: `<script>\n${test.output}\n</script>`
    })),
    // CallExpression on non-Svelte files
    ...EXPECTED_FILE_TYPES
      .filter((ext) => ext !== '.svelte')
      .flatMap(getCallExpressionTests),
    ...EXPECTED_FILE_TYPES
      .filter((ext) => ext !== '.svelte')
      .flatMap(getDeclarationTests)
  ],
  valid: [
    { code: `<div class="foo"></div>` },
    { code: `<div klass="foo"></div>` },
    { code: `<div class={clsx("${unorderedClasses}")}></div>`, options: [{ callees: ['twMerge'] }] },
    {
      code: `<div class="${unorderedClasses}"></div>`,
      options: [{ config: { prefix: 'other' } }]
    },
    {
      code: `clsx("${unorderedClasses}");`,
      filename: 'file.ts',
      options: [{ callees: ['twMerge'] }]
    },
    {
      code: 'twMerge({ "": "" });',
      filename: 'file.ts',
      options: [{ callees: ['twMerge'] }]
    },
    ...[{ names: ['styles'] }, { prefix: ['sty'] }, { suffix: ['les'] }].map((declarations) => ({
      code: `const variants = '${unorderedClasses}'`,
      filename: 'file.ts',
      options: [{ declarations }]
    }))
  ]
});
