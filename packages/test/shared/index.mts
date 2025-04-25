/* eslint-disable node/prefer-global/process */
import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import type { PluginSettings, Rules } from 'eslint-plugin-svelte-tailwindcss';
import svelteTailwind from 'eslint-plugin-svelte-tailwindcss';
import svelteParser from 'svelte-eslint-parser';

// @ts-expect-error Any
const baseConfig: Linter.Config[] = svelteTailwind.configs!.base;
const baseRules = baseConfig[1].rules;

type Options = {
  rules?: Partial<PrefixedRules>;
  settings?: Partial<PluginSettings>;
  tsRules?: Partial<PrefixedRules>;
};
type PrefixedRules = {
  [K in keyof Rules as `svelte-tailwindcss/${K}`]: Rules[K];
};

const generateConfig = ({ rules, settings, tsRules }: Options = {}): Linter.Config[] => [
  ...baseConfig,
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        // This is required to parse <script lang='ts'>
        parser: tsParser
      }
    },
    rules: {
      ...baseRules,
      ...(rules ?? {})
    },
    settings: {
      tailwindcss: {
        ...settings
      }
    }
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: {
      ...baseRules,
      ...(rules ?? {}),
      ...(tsRules ?? {})
    },
    settings: {
      tailwindcss: {
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
      config: './src/app.css',
      declarations: { suffix: ['_CLASSES'] },
      removeDuplicates: true
    }]
  }
});
const settings = generateConfig({
  settings: {
    callees: ['twMerge'],
    declarations: { suffix: ['_CLASSES'] },
    removeDuplicates: false
  },
  tsRules: {
    'svelte-tailwindcss/at-apply-require-postcss': 'warn',
    'svelte-tailwindcss/sort-classes': ['error', {
      config: './src/app.css'
    }]
  }
});

// TODO: Refactor into specific file
export const parseStdOut = (value: string) => value.split('\n').map((l) => {
  const iof = l.search(/\/v\d/);
  if (iof === -1) {
    return l;
  }

  return l.slice(iof);
}).join('\n');

export default process.env.TEST_TYPE === 'config'
  ? config
  : process.env.TEST_TYPE === 'settings'
    ? settings
    : base;
