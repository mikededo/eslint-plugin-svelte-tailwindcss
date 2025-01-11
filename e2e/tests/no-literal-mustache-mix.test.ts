import { describe, expect, it } from 'vitest';

import { isValidTest, lintResult } from '../helpers';
import { lintFile } from '../setup';

describe('no-literal-mustache-mix rule', () => {
  it('valid', async () => {
    await isValidTest('valid/no-literal-mustache-mix.svelte');
  });

  it('invalid', async () => {
    const res = await lintFile('invalid/no-literal-mustache-mix.svelte');
    expect(lintResult(res)).toMatchSnapshot();
  });
});

