import { fileURLToPath } from 'node:url';

export const workerDir = fileURLToPath(new URL(
  // Since e2e are also run with MODE === 'test', we change the env.MODE in the
  // vitest configuration to e2e-test, this way the e2e try to find the cjs
  // file over the ts file
  import.meta.env?.MODE === 'test' ? '../workers/config-v4.ts' : './workers/config-v4.cjs',
  import.meta.url
));
