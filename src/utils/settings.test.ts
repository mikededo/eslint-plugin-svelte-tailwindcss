import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMonorepoConfig, getOption } from './settings';

vi.mock('fs');
vi.mock('path', async (importActual) => ({
  ...(await importActual<typeof path>()),
  dirname: vi.fn(),
  join: vi.fn(),
  sep: '/'
}));

describe('getOption', () => {
  it('returns a defined context option when defined', () => {
    expect(
      getOption({ options: [{ monorepo: true }], settings: {} } as any, 'monorepo')
    ).toBe(true);
  });

  it('returns value from settings when not in options', () => {
    expect(
      getOption({ settings: { tailwindcss: { monorepo: true } } } as any, 'monorepo')
    ).toBe(true);
  });

  it('falls back to DEFAULT_CONFIG when not set in options or settings', () => {
    expect(getOption({ settings: {} } as any, 'monorepo')).toBe(false);
  });
});

describe('getMonorepoConfig', () => {
  type ReaddirSignature = (folderPath: string) => string[];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(path.dirname)
      .mockImplementation((val: string) => val.replace(/\/[^/]+$/, ''));
    vi.mocked(path.join)
      .mockImplementation((...parts: string[]) => parts.join('/'));
  });

  it('returns found config file in the same folder', () => {
    vi.mocked<ReaddirSignature>(fs.readdirSync).mockReturnValue(['tailwind.config.ts']);

    const result = getMonorepoConfig({
      cwd: '/project',
      filename: '/project/src/file.ts',
      settings: {}
    } as any);
    expect(result).toBe('/project/src/tailwind.config.ts');
  });

  it.each([
    { config: true, name: 'with config set' },
    { config: false, name: 'without config set' }
  ])('recursively searches higher folders if not in the current one $name', ({ config }) => {
    vi.mocked<ReaddirSignature>(fs.readdirSync)
      .mockImplementation((folderPath: string) =>
        folderPath === '/project/src'
          ? ['other.txt']
          : ['tailwind.config.ts']
      );

    const result = getMonorepoConfig({
      cwd: '/project',
      filename: '/project/src/file.ts',
      options: [{ config: config ? 'tailwind.config.ts' : null }],
      settings: {}
    } as any);
    expect(result).toBe('/project/tailwind.config.ts');
  });

  it('throws an error if folder does not start with cwd', () => {
    expect(() => {
      getMonorepoConfig({
        cwd: '/project',
        filename: '/other/file.ts',
        settings: {}
      } as any);
    }).toThrowError(
      'Unable to find config file.'
    );
  });
});
