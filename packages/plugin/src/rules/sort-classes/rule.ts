// Since the rule uses node workers and it's a bit of a pain to work with, this
// rule is tested in the test packages, in a kind of e2e

import type { ContextContainer, SVTPluginOptions } from '../../utils';

import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';

import {
  createNamedRule,
  extractClassnamesFromValue,
  getCallExpressionCalleeName,
  getFileType,
  getMonorepoConfig,
  getOption,
  getTemplateElementBody,
  getTemplateElementPrefix,
  getTemplateElementSuffix,
  isTsOrJsFile,
  SEP_REGEX,
  sortClasses
} from '../../utils';

export type MessageIds = 'sort-classes';
export type OptionList = Options[];
export type Options = Pick<
  SVTPluginOptions,
  'callees' | 'config' | 'declarations' | 'ignoredKeys' | 'monorepo' | 'removeDuplicates' | 'tags'
>;

const sortLiteral = (literal: TSESTree.Literal, twConfig: string): null | string => {
  if (!literal.value || typeof literal.value !== 'string') {
    return null;
  }

  return sortClasses(literal.value, twConfig);
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

const removeDuplicatesOrOriginalWithSpaces = ({
  headSpace,
  original,
  removeDuplicates = false,
  tailSpace,
  whitespaces
}: RemoveWithSpaces) => {
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
};

export const ContextCache = new Map<string, ContextContainer>();

export default createNamedRule<OptionList, MessageIds>({
  create(context) {
    const callees = getOption(context, 'callees');
    const declarations = getOption(context, 'declarations');
    const monorepo = getOption(context, 'monorepo');
    const twConfig = monorepo ? getMonorepoConfig(context) : getOption(context, 'config');
    const removeDuplicates = getOption(context, 'removeDuplicates');

    type ValidDeclarator = { init: NonNullable<TSESTree.VariableDeclarator['init']> } & TSESTree.VariableDeclarator;
    const isValidDeclarator = (node: TSESTree.VariableDeclarator): node is ValidDeclarator => {
      if (node.id?.type !== 'Identifier') {
        // Any other variable declarations are not supported
        return false;
      } else if (!node.init) {
        return false;
      }

      const fnName = node.id.name;
      const isPrefix = (declarations.prefix ?? []).some((prefix) => fnName.startsWith(prefix));
      const isSuffix = (declarations.suffix ?? []).some((suffix) => fnName.endsWith(suffix));
      const isName = (declarations.names ?? []).includes(fnName);
      return isPrefix || isSuffix || isName;
    };

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
        case 'BinaryExpression':
          sortNodeArgumentValue(node, arg.left);
          sortNodeArgumentValue(node, arg.right);

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
        case 'ReturnStatement':
          if (!arg.argument) {
            return;
          }

          sortNodeArgumentValue(node, arg.argument);
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
        case 'VariableDeclarator':
          if (!isValidDeclarator(arg)) {
            return;
          }

          sortNodeArgumentValue(node, arg.init);
          break;
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
        original: (sortClasses(classNames.join(' '), twConfig) ?? '').split(' '),
        removeDuplicates,
        tailSpace,
        whitespaces
      });

      const validatedClasses = classes.reduce((acc, cls, i, arr) => {
        const space = spaces[i] ?? '';

        if (i === arr.length - 1 && headSpace && tailSpace) {
          return `${acc}${space}${cls}${spaces[spaces.length - 1]}`;
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

    const callExpressionListener = (node: TSESTree.CallExpression) => {
      const calleName = getCallExpressionCalleeName(node);
      // Check if callee should be evaluated
      if (callees.findIndex((name) => calleName === name) === -1) {
        return;
      }

      node.arguments.forEach((arg) => {
        sortNodeArgumentValue(node, arg);
      });
    };

    const declaratorListener = (node: TSESTree.VariableDeclarator) => {
      if (!isValidDeclarator(node)) {
        return;
      }

      sortNodeArgumentValue(node, node.init);
    };

    const commonListeners = {
      CallExpression: callExpressionListener,
      VariableDeclarator: declaratorListener
    };
    if (isTsOrJsFile(getFileType(context.filename))) {
      return commonListeners;
    }

    return {
      ...Object.entries(commonListeners).reduce((acc, [key, listener]) => ({
        ...acc,
        [`SvelteScriptElement ${key}`]: listener
      }), {}),
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
            // Sort the literal
            const sorted = removeDuplicatesOrOriginal(
              sortLiteral(expr.expression, twConfig) ?? '',
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
          } else if (expr.expression.type === 'CallExpression') {
            callExpressionListener(expr.expression);
          } else {
            sortNodeArgumentValue(node, expr.expression);
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
        config: { type: ['string', 'object'] },
        declarations: {
          additionalProperties: false,
          properties: {
            names: {
              items: { type: 'string' },
              type: 'array',
              uniqueItems: true
            },
            prefix: {
              items: { type: 'string' },
              type: 'array',
              uniqueItems: true
            },
            suffix: {
              items: { type: 'string' },
              type: 'array',
              uniqueItems: true
            }
          },
          type: 'object'
        },
        ignoredKeys: {
          items: { minLength: 0, type: 'string' },
          type: 'array',
          uniqueItems: true
        },
        monorepo: { type: 'boolean' },
        removeDuplicates: { type: 'boolean' },
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
