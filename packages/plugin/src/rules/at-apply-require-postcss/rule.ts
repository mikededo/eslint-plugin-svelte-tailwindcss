import type { AST } from 'svelte-eslint-parser';

import { createNamedRule } from '../../utils';

// Fill this type with the message ids
export type MessageIds = 'require-postcss';
export type OptionList = [];

export default createNamedRule<OptionList, MessageIds>({
  create(rootContext) {
    const { sourceCode } = rootContext;
    const context = sourceCode.parserServices.getStyleContext?.();
    if (!context || context.status !== 'success') {
      return {};
    }

    return {
      SvelteStyleElement(node: AST.SvelteStyleElement) {
        const startTag = node.startTag;
        let classAttribute: AST.SvelteAttribute | null = null;
        const hasPostcssLangAttr = startTag.attributes.some((attr) => {
          if (attr.type !== 'SvelteAttribute') {
            return false;
          }

          classAttribute = attr;
          const { key, value } = attr;
          const attrValue = value[0];
          return key.name === 'lang' && attrValue.type === 'SvelteLiteral' && attrValue.value === 'postcss';
        });

        if (hasPostcssLangAttr) {
          return;
        }

        // Find first at rule, if any
        // If false, means that @apply has been found
        const includesApply = context.sourceAst.walk((node) => {
          if (node.type !== 'atrule') {
            return undefined;
          }

          return node.name === 'apply' ? false : undefined;
        });
        if (includesApply === undefined) {
          return;
        }

        rootContext.report({
          fix: (fixer) => {
            if (classAttribute) {
              return fixer.replaceText(classAttribute, 'lang="postcss"');
            }

            return fixer.insertTextBeforeRange([startTag.range[1] - 1, startTag.range[1]], ' lang="postcss"');
          },
          messageId: 'require-postcss',
          node
        });
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
      'require-postcss': 'Using \'@apply\' requires setting style lang to postcss'
    },
    schema: [{
      properties: {},
      type: 'object'
    }],
    type: 'problem'
  },
  name: 'at-apply-require-postcss'
});
