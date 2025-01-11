import type { ESLint } from 'eslint';
import { expect } from 'vitest';

import { lintFile } from './setup';

export const isValidTest = async (filename: string) => {
  const result = await lintFile(filename);
  expect(result.errorCount).toBe(0);
};

export const lintResult = ({
  fatalErrorCount,
  filePath,
  source,
  suppressedMessages,
  usedDeprecatedRules,
  ...rest
}: ESLint.LintResult) => (rest);
