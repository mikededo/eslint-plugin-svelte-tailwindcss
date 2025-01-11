import { describe, expect, it } from 'vitest';

import { isValidTest, lintResult } from '../helpers';
import { lintFile } from '../setup';

describe('at-apply-require-postcss rule', () => {
  it('valid: using `lang="postcss"`', async () => {
    await isValidTest('valid/at-apply-require-postcss.svelte');
  });

  it('valid: not using `@postcss`', async () => {
    await isValidTest('valid/at-apply-require-postcss-unused.svelte');
  });

  it('invalid', async () => {
    const res = await lintFile('invalid/at-apply-require-postcss.svelte');
    expect(lintResult(res)).toMatchSnapshot();
  });
});
