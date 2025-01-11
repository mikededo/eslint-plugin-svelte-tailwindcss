import type { Rules } from '../src/index.ts';
import type { SVTPluginOptions } from '../src/utils/types.ts';

import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import { ESLint } from 'eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';

import svelteTailwind from '../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type LintFileOptions = Partial<{
  rules: Rules;
  settings: SVTPluginOptions;
}>;
export const lintFile = async (filename: string, { rules, settings }: LintFileOptions = {}) => {
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

        // Customization per test
        rules: rules ?? {},
        settings: {
          tailwindcss: settings ?? {}
        }
      }
    ],
    overrideConfigFile: true
  });
  const results = await eslint.lintFiles([
    path.join(__dirname, 'fixtures', filename)
  ]);

  return results[0];
};
