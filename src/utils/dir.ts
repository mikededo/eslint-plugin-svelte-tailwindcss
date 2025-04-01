import { fileURLToPath } from 'node:url';

export const workerDir = fileURLToPath(new URL('./workers/config-v4.cjs', import.meta.url));
