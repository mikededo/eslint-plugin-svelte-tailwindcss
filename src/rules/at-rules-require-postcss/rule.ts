import { createNamedRule } from '../../utils';

export type OptionList = [];
// Fill this type with the message ids
export type MessageIds = 'require-postcss';

export default createNamedRule<OptionList, MessageIds>({
  create(_context) {
    return {
      SvelteStyleElement(node) {
        console.log(node);
      }
    };
  },
  defaultOptions: [
    // Configure here the default options, if any
  ],
  meta: {
    docs: {
      description: 'undefined'
    },
    messages: {
      'require-postcss': 'Using \'{{atRule}}\' requires setting style lang to postcss'
    },
    schema: [{
      properties: {},
      type: 'object'
    }],
    type: 'suggestion'
  },
  name: 'at-rules-require-postcss'
});
