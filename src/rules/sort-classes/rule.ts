import type { LegacyTailwindContext, ResolvedConfig, SVTPluginOptions } from '../../utils';

import type { TSESTree } from '@typescript-eslint/types';
import type * as ESTree from 'estree';
import type { AST } from 'svelte-eslint-parser';
// @ts-expect-error Specific tailwindcss API
import setupContextUtils from 'tailwindcss/lib/lib/setupContextUtils.js';

import {
  createNamedRule,
  extractClassnamesFromValue,
  getCallExpressionCalleeName,
  getMonorepoConfig,
  getOption,
  getTemplateElementBody,
  getTemplateElementPrefix,
  getTemplateElementSuffix,
  resolveConfig,
  SEP_REGEX,
  sortClasses
} from '../../utils';

const { createContext } = setupContextUtils;

export type MessageIds = 'sort-classes';
export type OptionList = Options[];
export type Options = Pick<
  SVTPluginOptions,
  'callees' | 'config' | 'ignoredKeys' | 'removeDuplicates' | 'tags'
>;

const sortLiteral = (literal: ESTree.Literal, context: LegacyTailwindContext): null | string => {
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
  removeDuplicates = false,
  trim = true
): string => {
  if (!removeDuplicates) {
    return original;
  }

  const splitted = original.split(SEP_REGEX);
  let result = '';
  let last = '';

  for (let i = 0; i < splitted.length; i++) {
    const value = splitted[i];
    if (!(value.trim()) || value === last) {
      continue;
    }

    last = value;
    result += `${value} `;
  }

  return result[result.length - 1] === ' ' && trim
    ? result.slice(0, -1)
    : result;
};

type RemoveWithSpaces = {
  whitespaces: string[];
  original: string[];
  headSpace?: boolean;
  tailSpace?: boolean;
  removeDuplicates?: boolean;
};
function removeDuplicatesOrOriginalWithSpaces({
  headSpace,
  original,
  removeDuplicates = false,
  tailSpace,
  whitespaces
}: RemoveWithSpaces) {
  if (!removeDuplicates) {
    return { classes: original, spaces: whitespaces };
  }

  const offset = (!headSpace && !tailSpace) || tailSpace ? -1 : 0;

  let previous = original[0];

  const classes = [previous];
  const whitespacesToRemoveIndices: number[] = [];

  for (let i = 1; i < original.length; i++) {
    const cls = original[i];
    if (cls === previous) {
      // Record the index in whitespaces that needs to be removed
      const wsIndex = i + offset - whitespacesToRemoveIndices.filter((index) => index < i + offset).length;
      whitespacesToRemoveIndices.push(wsIndex);
    } else {
      classes.push(cls);
      previous = cls;
    }
  }

  const spaces = [...whitespaces];
  whitespacesToRemoveIndices.sort((a, b) => b - a);
  for (const index of whitespacesToRemoveIndices) {
    if (index >= 0 && index < spaces.length) {
      spaces.splice(index, 1);
    }
  }

  return { classes, spaces };
}

export const ContextCache = new WeakMap<ResolvedConfig, ReturnType<typeof createContext>>();

export default createNamedRule<OptionList, MessageIds>({
  create(context) {
    const callees = getOption(context, 'callees');
    const monorepo = getOption(context, 'monorepo');
    const twConfig = monorepo ? getMonorepoConfig(context) : getOption(context, 'config');
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

    const sortNodeArgumentValue = (
      node: AST.SvelteAttribute | TSESTree.Node,
      arg: AST.SvelteLiteral | TSESTree.Node
    ) => {
      let originalClassNamesValue = null;
      let start = null;
      let end = null;
      let prefix = '';
      let suffix = '';

      switch (arg.type) {
        case 'ArrayExpression':
          arg.elements.forEach((arg) => {
            if (arg) {
              sortNodeArgumentValue(node, arg);
            }
          });

          return;
        case 'ConditionalExpression':
          sortNodeArgumentValue(node, arg.consequent);
          sortNodeArgumentValue(node, arg.alternate);

          return;
        case 'Literal':
          originalClassNamesValue = arg.value;
          start = arg.range[0] + 1;
          end = arg.range[1] - 1;

          break;
        case 'LogicalExpression':
          sortNodeArgumentValue(node, arg.right);

          return;
        case 'ObjectExpression': {
          arg.properties.forEach((prop) => {
            // If has a key, it's not a spread entry
            if ('key' in prop) {
              sortNodeArgumentValue(node, prop.key);
              sortNodeArgumentValue(node, prop.value);
            }
          });

          return;
        }
        case 'Property':
          sortNodeArgumentValue(node, arg.key);

          break;
        case 'SvelteLiteral':
          originalClassNamesValue = arg.value;
          start = arg.range[0];
          end = arg.range[1];

          break;
        case 'TemplateElement': {
          originalClassNamesValue = arg.value.raw;
          if (originalClassNamesValue === '') {
            return;
          }

          start = arg.range[0];
          end = arg.range[1];

          // https://github.com/eslint/eslint/issues/13360
          // The problem is that range computation includes the backticks (`test`)
          // but value.raw does not include them, so there is a mismatch.
          // start/end does not include the backticks, therefore it matches value.raw.
          const text = context.sourceCode.getText(arg);
          prefix = getTemplateElementPrefix(text, originalClassNamesValue)!;
          suffix = getTemplateElementSuffix(text, originalClassNamesValue)!;
          originalClassNamesValue = getTemplateElementBody(text, prefix, suffix);

          break;
        }
        case 'TemplateLiteral':
          arg.expressions.forEach((arg) => {
            sortNodeArgumentValue(node, arg);
          });
          arg.quasis.forEach((arg) => {
            sortNodeArgumentValue(node, arg);
          });

          return;
        default:
          return;
      }

      if (start === null || end === null) {
        return;
      }

      const { classNames, headSpace, tailSpace, whitespaces } =
        extractClassnamesFromValue(originalClassNamesValue);

      if (classNames.length <= 1) {
        // Don't run sorting for a single or empty className
        return;
      }

      const { classes, spaces } = removeDuplicatesOrOriginalWithSpaces({
        headSpace,
        original: (sortClasses(classNames, twContext) ?? '').split(' '),
        removeDuplicates,
        tailSpace,
        whitespaces
      });

      const validatedClasses = classes.reduce((acc, cls, i, arr) => {
        const space = spaces[i] ?? '';

        if (i === arr.length - 1 && headSpace && tailSpace) {
          return acc + (headSpace ? `${space}${cls}` : `${cls}${space}`) + (spaces[spaces.length - 1] ?? '');
        }

        return acc + (headSpace ? `${space}${cls}` : `${cls}${space}`);
      }, '');

      if (originalClassNamesValue !== validatedClasses) {
        context.report({
          fix: (fixer) => fixer.replaceTextRange([start, end], `${prefix}${validatedClasses}${suffix}`),
          messageId: 'sort-classes',
          node
        });
      }
    };

    return {
      'SvelteScriptElement CallExpression': (node: TSESTree.CallExpression) => {
        // TODO: Extract logic to work with ts/js files but without the SvelteScriptElement
        const calleName = getCallExpressionCalleeName(node);
        // Check if callee should be evaluated
        if (callees.findIndex((name) => calleName === name) === -1) {
          return;
        }

        node.arguments.forEach((arg) => {
          sortNodeArgumentValue(node, arg);
        });
      },
      'SvelteStartTag > SvelteAttribute': (node: AST.SvelteAttribute) => {
        if (node.key.name !== 'class') {
          return;
        }

        node.value.forEach((expr, i) => {
          if (expr.type === 'SvelteLiteral') {
            sortNodeArgumentValue(node, expr);
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
              // While the {} are redundant, it's not the rule's task to
              // ensure code cleanliness. In order to remove unnecessary
              // brackets, use svelte/no-useless-mustaches from
              // svelte-eslint-plugin
              // https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
              fix: (fixer) => fixer.replaceTextRange(expr.range, `{"${sorted}"}`),
              messageId: 'sort-classes',
              node: expr
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
                // While the {} are redundant, it's not the rule's task to
                // ensure code cleanliness. In order to remove unnecessary
                // brackets, use svelte/no-useless-mustaches from
                // svelte-eslint-plugin
                // https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
                fix: (fixer) => fixer.replaceText(arg, `"${sorted}"`),
                messageId: 'sort-classes',
                node: arg
              });
            });
          }
        });
      }
    };
  },
  defaultOptions: [{}],
  meta: {
    docs: {
      description: 'Sort Tailwind CSS classes'
    },
    fixable: 'code',
    messages: {
      'sort-classes': 'TailwindCSS classes should be sorted'
    },
    schema: [{
      properties:
      {
        callees: {
          items: { minLength: 0, type: 'string' },
          type: 'array',
          uniqueItems: true
        },
        config: {
          type: ['string', 'object']
        },
        ignoredKeys: {
          items: { minLength: 0, type: 'string' },
          type: 'array',
          uniqueItems: true
        },
        removeDuplicates: {
          type: 'boolean'
        },
        tags: {
          items: { minLength: 0, type: 'string' },
          type: 'array',
          uniqueItems: true
        }
      },
      type: 'object'
    }],
    type: 'suggestion'
  },
  name: 'sort-classes'
});
