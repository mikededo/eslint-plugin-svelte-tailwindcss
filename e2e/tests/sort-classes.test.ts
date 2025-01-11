import { describe, expect, it } from 'vitest';

import { isValidTest, lintResult } from '../helpers';
import { lintFile } from '../setup';

describe('sort-classes rule', () => {
  it('valid: properly sorted classes', async () => {
    await isValidTest('valid/sort-classes.svelte');
  });

  it('invalid: unsorted classes', async () => {
    const res = await lintFile('invalid/sort-classes.svelte', {
      settings: {
        callees: ['twMerge']
      }
    });
    expect(lintResult(res)).toMatchSnapshot();
  });
});

