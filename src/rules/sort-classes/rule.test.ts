import type * as Rule from './rule';

import type { TestCaseError } from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';
import svelteParser from 'svelte-eslint-parser';

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

// TODO: Extend tests
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
      // 16 is 12 plus the length of the {" and the "}
      errors: [getError()],
      output: `<div class={"${orderedClasses}"}></div>`
    },
    {
      code: `<div class="{"${unorderedClasses}"}"></div>`,
      // 17 is 13 plus the length of the {" and the "}
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
      code: `<div class="${unorderedClasses} {twMerge("${unorderedClasses}", variable)} ${unorderedClasses}"></div>`,
      errors: [getError(), getError(), getError()],
      options: [{ callees: ['twMerge'], removeDuplicates: false }],
      output: `<div class="${orderedClasses} {twMerge("${orderedClasses}", variable)} ${orderedClasses}"></div>`
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
      code: `<script>
const v = twMerge({ '${unorderedClasses}': true });
</script>`,
      errors: [getError()],
      options: [{ callees: ['twMerge'] }],
      output: `<script>
const v = twMerge({ '${orderedClasses}': true });
</script>`
    },
    {
      code: `<script>
const v = clsx({ true: '${unorderedClasses}' });
</script>`,
      errors: [getError()],
      options: [{ callees: ['clsx'] }],
      output: `<script>
const v = clsx({ true: '${orderedClasses}' });
</script>`
    },
    {
      code: `<script>
const v = ctl(\`${nlUnorderedClasses}\`);
</script>`,
      errors: [getError()],
      options: [{ callees: ['ctl'] }],
      output: `<script>
const v = ctl(\`${nlOrderedClasses}\`);
</script>`
    },
    {
      code: `
<script>
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
</script>
      `,
      errors: [getError(), getError()],
      options: [{ callees: ['ctl'] }],
      output: `
<script>
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
</script>
      `
    },
    {
      code: `<div class="\n${nlUnorderedClasses}\n"></div>`,
      errors: [getError()],
      output: `<div class="\n${nlOrderedClasses}\n"></div>`
    }
  ],
  valid: [
    { code: `<div class="foo"></div>` },
    { code: `<div class={clsx("${unorderedClasses}")}></div>`, options: [{ callees: ['twMerge'] }] }
  ]
});
