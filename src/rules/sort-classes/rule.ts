import type * as ESTree from 'estree';

import type { AST } from 'svelte-eslint-parser';
import type { LegacyTailwindContext, SVTPluginOptions } from '../../utils';
import { createNamedRule, getOption, resolveConfig, sortClasses } from '../../utils';
// @ts-expect-error Specific tailwindcss API
import { createContext } from 'tailwindcss/lib/lib/setupContextUtils';

export type Options = Pick<
  SVTPluginOptions,
  'callees' | 'config' | 'removeDuplicates' | 'tags' | 'ignoredKeys'
>;
export type OptionList = Options[];
export type MessageIds = 'sort-classes';

const sortLiteral = (literal: ESTree.Literal, context: LegacyTailwindContext): string | null => {
  if (!literal.value || typeof literal.value !== 'string') {
    return null;
  }

  return sortClasses(literal.value?.split(' '), context);
};

/**
 * Assumes `original` is already sorted
 */
const removeDuplicatesOrOriginal = (
  original: string,
  removeDuplicates: boolean = false,
  trim: boolean = true
): string => {
  if (!removeDuplicates) {
    return original;
  }

  const splitted = original.split(' ');
  let result = '';
  let last = '';
  for (let i = 0; i < splitted.length; i++) {
    const value = splitted[i];
    if (!value) {
      continue;
    }
    if (value === last) {
      continue;
    }
    last = value;
    result += `${value} `;
  }

  if (result[result.length - 1] === ' ' && trim) {
    return result.slice(0, -1);
  }
  return result;
};

type ResolvedConfig = NonNullable<ReturnType<typeof resolveConfig>>;
export const ContextCache = new WeakMap<ResolvedConfig, ReturnType<typeof createContext>>();

export default createNamedRule<OptionList, MessageIds>({
  meta: {
    docs: {
      description: 'Sort Tailwind CSS classes'
    },
    schema: [{
      type: 'object',
      properties:
      {
        callees: {
          type: 'array',
          items: { type: 'string', minLength: 0 },
          uniqueItems: true
        },
        ignoredKeys: {
          type: 'array',
          items: { type: 'string', minLength: 0 },
          uniqueItems: true
        },
        config: {
          type: ['string', 'object']
        },
        removeDuplicates: {
          type: 'boolean'
        },
        tags: {
          type: 'array',
          items: { type: 'string', minLength: 0 },
          uniqueItems: true
        }
      }
    }],
    messages: {
      'sort-classes': 'TailwindCSS classes should be sorted'
    },
    fixable: 'code',
    type: 'suggestion'
  },
  name: 'sort-classes',
  defaultOptions: [{}],
  create(context) {
    const callees = getOption(context, 'callees');
    const twConfig = getOption(context, 'config');
    const removeDuplicates = getOption(context, 'removeDuplicates');
    const mergedConfig = resolveConfig(twConfig);
    if (mergedConfig === null) {
      throw new Error('Could not resolve TailwindCSS config');
    }

    const twContext = (
      ContextCache.has(mergedConfig)
        ? ContextCache
        : ContextCache.set(mergedConfig, createContext(mergedConfig))
    ).get(mergedConfig);

    return {
      'SvelteStartTag > SvelteAttribute': (node: AST.SvelteAttribute) => {
        if (node.key.name !== 'class') {
          return;
        }

        node.value.forEach((expr, i) => {
          if (expr.type === 'SvelteLiteral') {
            const sortedValue = removeDuplicatesOrOriginal(
              sortClasses(expr.value.split(' '), twContext) ?? '',
              removeDuplicates,
              i === node.value.length - 1
            );
            if (sortedValue === expr.value) {
              return;
            }

            context.report({
              node: expr,
              messageId: 'sort-classes',
              fix: (fixer) => fixer.replaceTextRange(expr.range, sortedValue)
            });

            return;
          }

          if (expr.expression.type === 'Literal') {
            // Case class={"..."}
            // Sort the literal
            const sorted = removeDuplicatesOrOriginal(
              sortLiteral(expr.expression, twContext) ?? '',
              removeDuplicates,
              i === node.value.length - 1
            );
            if (!sorted || sorted === expr.expression.value) {
              return;
            }

            context.report({
              node: expr,
              messageId: 'sort-classes',
              // While the {} are redundant, it's not the rule's task to
              // ensure code cleanliness. In order to remove unnecessary
              // brackets, use svelte/no-useless-mustaches from
              // svelte-eslint-plugin
              // https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
              fix: (fixer) => fixer.replaceTextRange(expr.range, `{"${sorted}"}`)
            });
          } else if (expr.expression.type === 'CallExpression' && 'name' in expr.expression.callee) {
            // Case class={callee()}
            // Check if the callee is one of the given calles
            const included = callees.includes(expr.expression.callee.name);
            if (!included) {
              return;
            }

            expr.expression.arguments.forEach((arg) => {
              if (arg.type !== 'Literal') {
                return;
              }

              const sorted = removeDuplicatesOrOriginal(
                sortLiteral(arg, twContext) ?? '',
                removeDuplicates,
                i === node.value.length - 1
              );
              if (!sorted || sorted === arg.value) {
                return;
              }

              context.report({
                node: arg,
                messageId: 'sort-classes',
                // While the {} are redundant, it's not the rule's task to
                // ensure code cleanliness. In order to remove unnecessary
                // brackets, use svelte/no-useless-mustaches from
                // svelte-eslint-plugin
                // https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
                fix: (fixer) => fixer.replaceText(arg, `"${sorted}"`)
              });
            });
          }
        });
      }
    };
  }
});
