import path from 'node:path';

export const EXPECTED_FILE_TYPES = [
  '.cjs',
  '.cts',
  '.js',
  '.mjs',
  '.mts',
  '.svelte',
  '.ts'
] as const;
export type ExpectedFileType = (typeof EXPECTED_FILE_TYPES)[number];

const isExpectedFileType = (ext: string): ext is ExpectedFileType => EXPECTED_FILE_TYPES.includes(ext as any);

export const getFileType = (file: string): ExpectedFileType | null => {
  const ext = path.extname(file);
  return isExpectedFileType(ext) ? ext : null;
};

export const isTsOrJsFile = (fileType: ExpectedFileType | null) => !(fileType === '.svelte' || fileType === null);
