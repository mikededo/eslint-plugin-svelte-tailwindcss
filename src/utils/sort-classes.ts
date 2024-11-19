import type { LegacyTailwindContext } from './types';

type TransformerEnv = {
  context: LegacyTailwindContext;
  parsers?: any;
  generateRules?: (
    classes: Iterable<string>,
    context: LegacyTailwindContext,
  ) => [bigint][];
};

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

const prefixCandidate = (
  context: LegacyTailwindContext,
  selector: string
): string => {
  const prefix = context.tailwindConfig.prefix;
  return typeof prefix === 'function' ? prefix(selector) : prefix + selector;
};

// Polyfill for older Tailwind CSS versions
const getClassOrderPolyfill = (classes: string[], env: TransformerEnv) => {
  // A list of utilities that are used by certain Tailwind CSS utilities but
  // that don't exist on their own. This will result in them "not existing" and
  // sorting could be weird since you still require them in order to make the
  // host utitlies work properly. (Thanks Biology)
  const parasiteUtilities = new Set([
    prefixCandidate(env.context, 'group'),
    prefixCandidate(env.context, 'peer')
  ]);
  const classNamesWithOrder: [string, bigint | null][] = [];

  for (const className of classes) {
    let order = env.generateRules?.(new Set([className]), env.context)
      .sort(([a], [z]) => bigSign(z - a))[0]?.[0] ?? null;

    if (order === null && parasiteUtilities.has(className)) {
      // This will make sure that it is at the very beginning of the
      // `components` layer which technically means 'before any
      // components'.
      order = env.context.layerOrder.components;
    }

    classNamesWithOrder.push([className, order]);
  }

  return classNamesWithOrder;
};

type SortOptions = {
  env: TransformerEnv;
  ignoreFirst?: boolean;
  ignoreLast?: boolean;
};

const sort = (
  className: string,
  { env, ignoreFirst = false, ignoreLast = false }: SortOptions
) => {
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

  const prefix = ignoreFirst
    ? `${classes.shift() ?? ''}${whitespace.shift() ?? ''}`
    : '';
  const suffix = ignoreLast
    ? `${whitespace.pop() ?? ''}${classes.pop() ?? ''}`
    : '';
  const classNamesWithOrder = env.context.getClassOrder
    ? env.context.getClassOrder(classes)
    : getClassOrderPolyfill(classes, env);

  ;
  const result = classNamesWithOrder
    .sort(bigIntSorter)
    .map(([className]) => className)
    .reduce(
      (acc, className, i) => `${acc}${className}${whitespace[i] ?? ''}`,
      ''
    );
  return prefix + result + suffix;
};

export const sortClasses = (unordered: string[], context: LegacyTailwindContext): string =>
  sort(unordered.join(' '), { env: { context } });

