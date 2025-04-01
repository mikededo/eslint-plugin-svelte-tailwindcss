import { describe, expect, it } from 'vitest';

import { getFileType, isTsOrJsFile } from './files';

describe('getFileType', () => {
  it('should return the correct file type for known extensions', () => {
    expect(getFileType('example.cjs')).toBe('.cjs');
    expect(getFileType('example.cts')).toBe('.cts');
    expect(getFileType('example.js')).toBe('.js');
    expect(getFileType('example.mjs')).toBe('.mjs');
    expect(getFileType('example.mts')).toBe('.mts');
    expect(getFileType('example.svelte')).toBe('.svelte');
    expect(getFileType('example.ts')).toBe('.ts');
  });

  it('should return null for unknown or invalid extensions', () => {
    expect(getFileType('example.txt')).toBeNull();
    expect(getFileType('example.md')).toBeNull();
    expect(getFileType('example.json')).toBeNull();
    expect(getFileType('example')).toBeNull();
  });

  it('should handle files with multiple dots correctly', () => {
    expect(getFileType('my.test.ts')).toBe('.ts');
    expect(getFileType('some.config.cjs')).toBe('.cjs');
    expect(getFileType('component.test.svelte')).toBe('.svelte');
    expect(getFileType('my.unknown.ext')).toBeNull();
  });
});

describe('isTsOrJsFile', () => {
  it('should return true for TypeScript and JavaScript files', () => {
    expect(isTsOrJsFile('.ts')).toBe(true);
    expect(isTsOrJsFile('.js')).toBe(true);
    expect(isTsOrJsFile('.mts')).toBe(true);
    expect(isTsOrJsFile('.mjs')).toBe(true);
    expect(isTsOrJsFile('.cts')).toBe(true);
    expect(isTsOrJsFile('.cjs')).toBe(true);
  });

  it('should return false for Svelte files', () => {
    expect(isTsOrJsFile('.svelte')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isTsOrJsFile(null)).toBe(false);
  });
});
