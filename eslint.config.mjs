import antfu from '@antfu/eslint-config';
import perfectionist from 'eslint-plugin-perfectionist';

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
  jsonc: true,
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
      }],
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
      ]
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
  )
  .override(
    'antfu/perfectionist/setup',
    {
      rules: {
        ...(perfectionist.configs['recommended-alphabetical'].rules ?? {}),
        'perfectionist/sort-exports': [
          'error',
          {
            ignoreCase: true,
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-imports': [
          'error',
          {
            environment: 'bun',
            groups: [
              'style',
              'internal-type',
              ['parent-type', 'sibling-type', 'index-type'],
              ['builtin', 'external'],
              'internal',
              ['parent', 'sibling', 'index'],
              'object',
              'unknown'
            ],
            ignoreCase: true,
            maxLineLength: undefined,
            newlinesBetween: 'always',
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-object-types': [
          'error',
          {
            customGroups: { callbacks: 'on*' },
            groupKind: 'required-first',
            groups: ['unknown', 'callbacks', 'multiline'],
            ignoreCase: true,
            order: 'asc',
            partitionByNewLine: true,
            type: 'alphabetical'
          }
        ]
      }
    }
  );

