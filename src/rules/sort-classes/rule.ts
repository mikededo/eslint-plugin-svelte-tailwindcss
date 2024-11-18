import type * as ESTree from 'estree';
import type { AST } from 'svelte-eslint-parser';

import type { LegacyTailwindContext, SVTPluginOptions } from '../../utils';
import { createNamedRule, getOption, resolveConfig, sortClasses } from '../../utils';
// @ts-expect-error Specific tailwindcss API
import { createContext } from 'tailwindcss/lib/lib/setupContextUtils';

export type Options = Pick<
  SVTPluginOptions,
  'callees' | 'config' | 'removeDuplicates' | 'tags' | 'ignoredKeys'
>[];
export type MessageIds = 'sort-classes';

const groupLiteralAndMoustaches = (literals: Array<AST.SvelteLiteral | AST.SvelteMustacheTag>) => {
  const result: [AST.SvelteLiteral[], AST.SvelteMustacheTag[]] = [[], []];

  literals.forEach((literal) => {
    if (literal.type === 'SvelteLiteral') {
      result[0].push(literal);
    } else {
      result[1].push(literal);
    }
  });

  return result;
};

const sortLiteral = (literal: ESTree.Literal, context: LegacyTailwindContext): string | null => {
  if (!literal.value || typeof literal.value !== 'string') {
    return null;
  }

  return sortClasses(literal.value?.split(' '), context);
};

type ResolvedConfig = NonNullable<ReturnType<typeof resolveConfig>>;
export const ContextCache = new WeakMap<ResolvedConfig, ReturnType<typeof createContext>>();

export default createNamedRule<Options, MessageIds>({
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
    const { sourceCode } = context;
    const callees = getOption(context, 'callees');
    const twConfig = getOption(context, 'config');
    const mergedConfig = resolveConfig(twConfig);
    if (mergedConfig === null) {
      throw new Error('Could not resolve TailwindCSS config');
    }

    const ctxFallback = (
      ContextCache.has(mergedConfig)
        ? ContextCache
        : ContextCache.set(mergedConfig, createContext(mergedConfig))
    ).get(mergedConfig);

    return {
      'SvelteStartTag > SvelteAttribute': (node: AST.SvelteAttribute) => {
        if (node.key.name !== 'class') {
          return;
        }

        const [literals, mustaches] = groupLiteralAndMoustaches(node.value);
        if (!literals.length && !mustaches.length) {
          // In case the class attribute is empty
          return;
        }

        if (literals.length === 0) {
          // Case class={...}
          const [first] = mustaches;
          if (first.expression.type === 'Literal') {
            // Sort the literal
            const sorted = sortLiteral(first.expression, ctxFallback);
            if (sorted && sorted !== first.expression.value) {
              context.report({
                node: first,
                messageId: 'sort-classes',
                // While the {} are redundant, it's not the rule's task to
                // ensure code cleanliness. In order to remove unnecessary
                // brackets, use svelte/no-useless-mustaches from
                // svelte-eslint-plugin
                // https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
                fix: (fixer) => fixer.replaceText(node, `class={"${sorted}"}`)
              });
            }
          } else if (first.expression.type === 'CallExpression' && 'name' in first.expression.callee) {
            // Check if the callee is one of the given calles
            const included = callees.includes(first.expression.callee.name);
            if (!included) {
              return;
            }

            first.expression.arguments.forEach((arg) => {
              if (arg.type !== 'Literal') {
                return;
              }

              const sorted = sortLiteral(arg, ctxFallback);
              if (sorted && sorted !== arg.value) {
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
              }
            });
          }

          return;
        }

        const sorted = sortClasses(literals.map(({ value }) => value.trim()), ctxFallback);
        // Append moustaches
        const sortedWithMoustaches = mustaches.reduce((acc, node) => `${acc} ${sourceCode.getText(node)}`.trim(), sorted);

        const [_, content] = sourceCode.getText(node).split('"') ?? [];
        if (!content) {
          // Safe check
          return;
        }
        if (sortedWithMoustaches === content) {
          // Classes are already sorted
          return;
        }

        context.report({
          node,
          messageId: 'sort-classes',
          fix: (fixer) => fixer.replaceText(node, `class="${sortedWithMoustaches}"`)
        });
      }
    };
  }
});
