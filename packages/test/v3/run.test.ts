import Utils from '@eslint-plugin-svelte-tailwindcss/test-shared/utils';
import { spawnSync } from 'node:child_process';

describe('e2e', () => {
  it.each(['default', 'config', 'settings'] as const)('should lint with the %s configuration', async (type) => {
    const result = spawnSync(`TEST_TYPE=${type === 'default' ? '' : type} pnpm lint`, [], {
      encoding: 'utf-8',
      shell: true
    });

    expect(Utils.parseStdOut(result.stdout)).toMatchSnapshot('stdout');
    expect(result.status).toMatchSnapshot('exit code');
  });
});
