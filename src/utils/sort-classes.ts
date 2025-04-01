import { createSyncFn } from 'synckit';

import { workerDir } from './dir';

const bigSign = (value: bigint) =>
  Number(value > 0n) - Number(value < 0n);

const bigIntSorter = ([, a]: [string, bigint | null], [, z]: [string, bigint | null]): number => {
  if (a === z) {
    return 0;
  }

  if (a === null) {
    return -1;
  }

  if (z === null) {
    return 1;
  }

  return bigSign(a - z);
};

const getClassOrderSync = createSyncFn<
  (path: string, clases: string[]) => Promise<[string, bigint | null][]>
>(workerDir);

export const sortClasses = (className: string, twConfig: string) => {
  if (typeof className !== 'string' || className === '') {
    return className;
  }

  if (className.includes('{{')) {
    return className;
  }

  const parts = className.split(/([\t\n\f\r ]+)/);
  const classes = parts.filter((_, i) => i % 2 === 0);
  const whitespace = parts.filter((_, i) => i % 2 !== 0);

  if (classes[classes.length - 1] === '') {
    classes.pop();
  }

  const result = getClassOrderSync(twConfig, classes)
    .sort(bigIntSorter)
    .map(([className]) => className)
    .reduce(
      (acc, className, i) => `${acc}${className}${whitespace[i] ?? ''}`,
      ''
    );

  return result;
};

