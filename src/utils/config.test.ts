import fs from 'node:fs';
import defaultConfig from 'tailwindcss/defaultConfig.js';
// @ts-expect-error Specific Tailwind API
import loadConfigModule from 'tailwindcss/lib/lib/load-config.js';
import twResolveConfig from 'tailwindcss/resolveConfig.js';

import {
  resetCachedConfigValues,
  resolveConfig,
  setResolvedConfig
} from './config';

vi.mock('tailwindcss/lib/lib/load-config.js');
vi.mock('tailwindcss/resolveConfig.js');
vi.mock('node:fs', async () => ({
  default: { statSync: vi.fn(() => ({ mtime: new Date() })) }
}));

const CONFIG_PATH = 'tailwind.config.ts';

describe('resolveConfig', () => {
  beforeEach(() => {
    resetCachedConfigValues();

    vi.clearAllMocks();
    vi.mocked(loadConfigModule.loadConfig).mockReturnValue(defaultConfig);
    vi.mocked(twResolveConfig).mockImplementation((config) => config as any);
  });

  it.each([
    CONFIG_PATH,
    '/absolute/path/custom.config.ts'
  ])('should resolve config for %s', (filePath) => {
    const result = resolveConfig(filePath);
    expect(result).toBeDefined();
    expect(loadConfigModule.loadConfig).toHaveBeenCalledWith(expect.stringContaining(filePath));
  });

  it('should cache resolved config', () => {
    const firstResult = resolveConfig(CONFIG_PATH);
    const secondResult = resolveConfig(CONFIG_PATH);

    expect(loadConfigModule.loadConfig).toHaveBeenCalledTimes(1);
    expect(firstResult).toBe(secondResult);
  });

  it('should reload config when file is modified', () => {
    const year = new Date().getFullYear();
    vi.mocked(fs.statSync)
      .mockReturnValueOnce({ mtime: new Date(year, 1, 1) } as fs.Stats)
      .mockReturnValueOnce({ mtime: new Date(year, 1, 2) } as fs.Stats);

    resolveConfig(CONFIG_PATH);
    resetCachedConfigValues();
    resolveConfig(CONFIG_PATH);

    expect(loadConfigModule.loadConfig).toHaveBeenCalledTimes(2);
  });

  it('should return default config when config file is not found', () => {
    const result = resolveConfig(CONFIG_PATH);

    expect(twResolveConfig).toHaveBeenCalledWith(defaultConfig);
    expect(result).toBeDefined();
  });

  it('should handle null config file', () => {
    vi.mocked(loadConfigModule.loadConfig).mockReturnValue(null);
    const result = resolveConfig(CONFIG_PATH);

    expect(twResolveConfig).toHaveBeenCalledWith(defaultConfig);
    expect(result).toBeDefined();
  });

  it('should use cached config when content has not changed', () => {
    const mockResolvedConfig = { theme: { extend: {} } };
    setResolvedConfig(mockResolvedConfig);

    vi.mocked(loadConfigModule.loadConfig).mockReturnValue(null);
    const result = resolveConfig(CONFIG_PATH);

    expect(result).toBe(mockResolvedConfig);
  });
});
