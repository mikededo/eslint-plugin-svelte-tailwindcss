import { fileURLToPath } from 'node:url';

export const workerDir = fileURLToPath(new URL(
  import.meta.env?.MODE === 'test' ? '../workers/config-v4.ts' : './workers/config-v4.cjs',
  import.meta.url
));
