import type { Rules } from '../src/index.ts';
import type { SVTPluginOptions } from '../src/utils/types.ts';

import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import { ESLint } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import svelteParser from 'svelte-eslint-parser';

import svelteTailwind from '../src/index';

type LintFileOptions = Partial<{
  rules: Partial<PluginRules>;
  settings: SVTPluginOptions;
  /**
   * This prop should omly be used by the tests with the settings as the
   * default configuration DOES NOT parse and validate TS files
   */
  tsRules?: Partial<PluginRules>;
}>;
type PluginRules = {
  [K in keyof Rules as K extends string ? `svelte-tailwindcss/${K}` : never]: Rules[K]
};

const lintFile = async (filePath: string, { rules, settings, tsRules }: LintFileOptions = {}) => {
  const eslint = new ESLint({
    overrideConfig: [
      ...svelteTailwind.configs!.base as Linter.Config[],
      {
        files: ['**/*.svelte', '*.svelte'],
        languageOptions: {
          parser: svelteParser,
          parserOptions: {
            // This is required to parse <script lang='ts'>
            parser: tsParser
          }
        },

        // Customization per test group
        rules: rules ?? {},
        settings: {
          tailwindcss: settings ?? {}
        }
      },
      {
        // Run also for ts file
        files: ['**/*.ts', '*.ts'],
        languageOptions: {
          parser: tsParser
        },

        // Customization per test group
        rules: rules ?? tsRules ?? {},
        settings: {
          tailwindcss: settings ?? {}
        }
      }
    ],
    overrideConfigFile: true
  });

  return await eslint.lintFiles(filePath);
};

const lintResult = (results: ESLint.LintResult[]) => results.map(({
  filePath,
  source,
  suppressedMessages,
  usedDeprecatedRules,
  ...rest
}: ESLint.LintResult) => (rest));

const listAllFiles = (pathname: string): string[] => fs.readdirSync(pathname)
  .reduce((files, name) => {
    // Check if dir and call recursively
    if (fs.statSync(path.join(pathname, name)).isDirectory()) {
      return [...files, ...listAllFiles(path.join(pathname, name))];
    }

    // Otherwise, return the file
    return [...files, path.join(pathname, name)];
  }, [] as string[]);

const getSnapshotFile = (type: 'default' | 'rules' | 'settings', testFile: string) =>
  `__snapshots__/${type}-configuration/${testFile}.snap`;

describe('e2e', () => {
  const files = listAllFiles('src');

  describe.sequential('default configuration', () => {
    it.each(files)('lint: %s', async (file) => {
      await expect(
        lintResult(await lintFile(file))
      ).toMatchFileSnapshot(getSnapshotFile('default', file));
    });
  });

  describe('custom rules configuration', () => {
    it.each(files)('lint: %s', async (file) => {
      await expect(
        lintResult(
          await lintFile(file, {
            rules: {
              'svelte-tailwindcss/at-apply-require-postcss': 'warn',
              'svelte-tailwindcss/sort-classes': ['error', {
                callees: ['twMerge'],
                declarations: { suffix: ['_CLASSES'] },
                monorepo: false,
                removeDuplicates: true
              }]
            }
          })
        )
      ).toMatchFileSnapshot(getSnapshotFile('rules', file));
    });
  });

  describe('custom settings configuration', () => {
    it.each(files)('lint: %s', async (file) => {
      await expect(
        lintResult(
          await lintFile(file, {
            settings: {
              callees: ['twMerge'],
              declarations: { suffix: ['_CLASSES'] },
              removeDuplicates: false
            },
            tsRules: {
              'svelte-tailwindcss/at-apply-require-postcss': 'warn',
              'svelte-tailwindcss/sort-classes': 'error'
            }
          })
        )
      ).toMatchFileSnapshot(getSnapshotFile('settings', file));
    });
  });
});
