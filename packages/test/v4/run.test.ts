import { spawnSync } from "node:child_process";

describe('e2e', () => {
  it.each(['default', 'config', 'settings'] as const)('should lint with the %s configuration', async (type) => {
    const result = spawnSync(`TEST_TYPE=${type === 'default' ? '' : type} bun lint`, [], {
      encoding: 'utf-8',
      shell: true 
    });

    expect(result.stdout).toMatchSnapshot('stdout');
    expect(result.status).toMatchSnapshot('exit code');
  });
})
