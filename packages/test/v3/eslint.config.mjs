// @ts-check
import tsParser from '@typescript-eslint/parser';
import svelteTailwind from 'eslint-plugin-svelte-tailwindcss';
import svelteParser from 'svelte-eslint-parser';

/**
 * @typedef {import('eslint').Linter.LintMessage} LintMessage
 * @typedef {import('../src/index.js').Rules} Rules
 * @typedef {Partial<Record<`svelte-tailwindcss/${string}`, any>>} PluginRules
 * @typedef {import('../src/index.js').PluginSettings} Settings
 */

/**
 * Generates ESLint configuration for Svelte and TypeScript projects.
 *
 * @param {object} [options] - Configuration options.
 * @param {Partial<PluginRules>} [options.rules] - Custom linting rules.
 * @param {Partial<Settings>} [options.settings] - Tailwind plugin settings.
 * @param {Partial<PluginRules>} [options.tsRules] - TypeScript-specific linting rules.
 * @returns {Promise<LintMessage[]>} The ESLint configuration array.
 */
const generateConfig = async ({ rules, settings, tsRules } = {}) => [
  // @ts-expect-error Configs is defined
  ...svelteTailwind.configs.base,
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        // This is required to parse <script lang='ts'>
        parser: tsParser
      }
    },
    rules: rules ?? {},
    settings: {
      tailwindcss: {
        config: 'tailwind.config.ts',
        ...settings
      }
    }
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser
    },
    rules: rules ?? tsRules ?? {},
    settings: {
      tailwindcss: {
        config: 'tailwind.config.ts',
        ...settings
      }
    }
  },
  {
    ignores: ['node_modules', './run.test.ts']
  }
];

const base = generateConfig();
const config = generateConfig({
  rules: {
    'svelte-tailwindcss/at-apply-require-postcss': 'warn',
    'svelte-tailwindcss/sort-classes': ['error', {
      callees: ['twMerge'],
      declarations: { suffix: ['_CLASSES'] },
      monorepo: false,
      removeDuplicates: true
    }]
  },
});
const settings = await generateConfig({
  settings: {
    callees: ['twMerge'],
    declarations: { suffix: ['_CLASSES'] },
    removeDuplicates: false
  },
  tsRules: {
    'svelte-tailwindcss/at-apply-require-postcss': 'warn',
    'svelte-tailwindcss/sort-classes': 'error'
  }
});

export default process.env.TEST_TYPE === 'config'
  ? config
  : process.env.TEST_TYPE === 'settings'
    ? settings
    : base;
