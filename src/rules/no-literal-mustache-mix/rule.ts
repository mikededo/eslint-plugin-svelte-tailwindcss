import type { AST } from 'svelte-eslint-parser';

import { createNamedRule } from '../../utils';

// Fill this type with the message ids
export type MessageIds = 'no-mix';
export type OptionList = [];

const CLASS_PREFIX = 'class="';

export default createNamedRule<OptionList, MessageIds>({
  create(context) {
    const src = context.sourceCode;

    return {
      'SvelteStartTag > SvelteAttribute': (node: AST.SvelteAttribute) => {
        if (node.key.name !== 'class') {
          return;
        }
        // If there's a single mustache, then it will enter the check
        if (node.value.length < 2) {
          return;
        }

        // Subtract - 1 since it includes the "
        const nodeText = src.getText(node).slice(CLASS_PREFIX.length - 1);

        let mustachesFirst = false;
        const [literals, mustaches] = node.value.reduce<[AST.SvelteLiteral[], AST.SvelteMustacheTag[]]>(
          (acc, expr, i) => {
            if (expr.type === 'SvelteLiteral') {
              acc[0].push(expr);
            } else if (expr.type === 'SvelteMustacheTag') {
              acc[1].push(expr);
              if (!mustachesFirst && i === 0) {
                mustachesFirst = true;
              }
            }
            return acc;
          },
          [[], []]
        );

        // Spaces between mustaches are parsed as literals, so we need to filter empty strings
        const joinedLiterals = literals.map((l) => l.value.trim()).filter(Boolean).join(' ');
        const joinedMustaches = mustaches.map((m) => src.getText(m)).join(' ');
        const result = (
          mustachesFirst
            ? `${joinedMustaches} ${joinedLiterals}`
            : `${joinedLiterals} ${joinedMustaches}`
        ).trim();

        if (`"${result}"` !== nodeText) {
          context.report({
            fix: (fixer) => fixer.replaceTextRange([node.range[0] + CLASS_PREFIX.length, node.range[1] - 1], result),
            messageId: 'no-mix',
            node
          });
        }
      }
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'undefined'
    },
    fixable: 'code',
    messages: {
      // Add message ids here - note minimum one message is required
      'no-mix': 'Do not mix literal expressions with mustache expressions'
    },
    schema: [],
    type: 'suggestion'
  },
  name: 'no-literal-mustache-mix'
});
