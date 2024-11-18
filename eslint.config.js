import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: {
    css: true,
    html: true
  },
  ignores: [
    '.DS_Store',
    '.git',
    'dist/',
    'node_modules/',
    'tsconfig.tsbuildinfo'
  ],
  jsonc: false,
  lessOpinionated: true,
  markdown: false,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true
  },
  toml: false,
  typescript: {
    overrides: {
      'no-use-before-define': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-imports': ['error', {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports'
      }],
      'ts/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
      'ts/no-use-before-define': ['error', {
        classes: false,
        enums: false,
        functions: true,
        ignoreTypeReferences: true,
        typedefs: false,
        variables: true
      }]
    }
  },
  yaml: false
}, {
  files: ['**/*.d.ts'],
  rules: {
    'ts/consistent-type-definitions': ['off']
  }
})
  .override(
    'antfu/stylistic/rules',
    {
      rules: {
        'style/arrow-parens': ['error', 'always'],
        'style/brace-style': ['error', '1tbs'],
        'style/comma-dangle': ['error', 'never'],
        'style/indent': [
          'error',
          2,
          {
            flatTernaryExpressions: true,
            offsetTernaryExpressions: true,
            SwitchCase: 1
          }
        ],
        'style/no-multiple-empty-lines': ['error', { max: 1 }],
        'style/operator-linebreak': ['error', 'after', {
          overrides: { ':': 'before', '?': 'before' }
        }],
        'style/quote-props': ['error', 'as-needed']
      }
    }
  );
