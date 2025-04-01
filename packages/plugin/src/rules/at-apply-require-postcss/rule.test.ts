
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

const ERROR = { message: 'Using \'@apply\' requires setting style lang to postcss' };

tester.run('at-apply-require-postcss', rule, {
  invalid: [
    {
      code: `
<style>
  .foo {
    @apply flex;
    .foo {
      @apply px-8;
      .foo {
        @apply px-8;
      }
    }
  }
</style>
`,
      errors: [ERROR],
      output: `
<style lang="postcss">
  .foo {
    @apply flex;
    .foo {
      @apply px-8;
      .foo {
        @apply px-8;
      }
    }
  }
</style>
`
    },
    {
      code: `
<div class="foo"></div>
<style lang="scss">
  .foo {
    .foo {
      .foo {
        .foo {
          @apply flex;
        }
      }
    }
  }
</style>
`,
      errors: [ERROR],
      output: `
<div class="foo"></div>
<style lang="postcss">
  .foo {
    .foo {
      .foo {
        .foo {
          @apply flex;
        }
      }
    }
  }
</style>
`
    },
    {
      code: `
<style>
  .foo {
    @ap flex;
    @app flex;
    @apply flex;
  }
</style>
`,
      errors: [ERROR],
      output: `
<style lang="postcss">
  .foo {
    @ap flex;
    @app flex;
    @apply flex;
  }
</style>
`
    },
    {
      code: '<style lang="scss">.foo { @apply flex; }</style>',
      errors: [ERROR],
      output: '<style lang="postcss">.foo { @apply flex; }</style>'
    },
    {
      code: '<style lang="css">.foo { @apply flex; }</style>',
      errors: [ERROR],
      output: '<style lang="postcss">.foo { @apply flex; }</style>'
    }
  ],
  valid: [
    { code: '<style lang="postcss"></style>' },
    { code: '<style lang="postcss">.foo { @apply flex; }</style>' },
    { code: '<style>.foo { @anything flex; }</style>' },
    {
      code: `
<style lang="postcss">
  .foo {
    @apply flex;
  }
</style>
`
    },
    {
      code: `
<style lang="postcss">
  .foo {
    .foo {
      .foo {
        .foo {
          @apply flex;
        }
      }
    }
  }
</style>
`
    },
    // StyleContext.status === "no-style-element"
    { code: '' },
    // StyleContext.status "unknown-lang"
    { code: '<style lang="tcss"></style>' }
  ]
});
