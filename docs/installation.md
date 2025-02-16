# Installation

In order to get started, install the plugin alongside
[`svelte-eslint-parser`](https://github.com/sveltejs/eslint-plugin-svelte). This
assumes that you already have `eslint` and `tailwdincss` installed.

You can use the package manager of your choice.

```bash
bun add -d eslint-plugin-svelte-tailwindcss@next svelte-eslint-parser
```

## Configuration

```javascript
// eslint.config.js
import svelteTailwindcss from 'eslint-plugin-svelte-tailwindcss';

export default [
  ...svelteTailwindcss.configs['flat/base']
];


// If you want to customise the options
export default [
  ...svelteTailwindcss.configs['flat/base'],
  {
    rules: {
      'svelte-tailwindcss/sort-classes': ['warn']
    }
  }
]


// You can also provide customise ESLint settings, so the options would be
// available for all rules
export default [
  ...svelteTailwindcss.configs['flat/base'],
  {
    settings: { monorepo: true }
  }
]
```

### Linting `js` or `ts` files

While the plugin is designed to work with Svelte files, it can also be used to
lint JavaScript and TypeScript files. In order to enable the plugin for such
files, add  the following to the ESLint configuration:

```js
// eslint.config.js
import svelteTailwindcss from 'eslint-plugin-svelte-tailwindcss';
// You will need to install @typescript-eslint/parser
import tsParser from '@typescript-eslint/parser';

export default [
  ...svelteTailwindcss.configs['flat/base'],
  {
    files: ['**/*.ts', '*.ts'],
    languageOptions: {
      parser: tsParser
    },
    rules: {
      'svelte-tailwindcss/at-apply-require-postcss': 'warn',
      'svelte-tailwindcss/sort-classes': 'error'
    }
  }
];
```

> Note: If you are using the `eslint-plugin-tailwindcss`, you may encounter
> conflicts between the two plugins as they will both report issues for the same
> line.  
> I'd recommend disabling one of the two plugins or the conflicting rules of the
> plugins.

## Options

Here's the list of options available for the plugin:

- `callees`: An array of strings representing the names of the functions that
  should _also_ be checked for class sorting. By default, this value is `[]`.
  Callees used inside the `class` attribute are also checked for class sorting.
- `config`: A string representing the path of the Tailwind config file. By
  default checks the value from the `loadConfig` function provided from
  `tailwindcss`.
- `declarations`: Possible prefixes, suffixes and names that will be used to
  check if a variable declaration should be evaluated. For example, if you use an
  object to store variants, and you want the properties of that object to be
  evaluated, you should define the object name/prefix/suffix here. This is done so
  that the plugin can skip most of the declarations with literals that are no
  relevant. Also works for function and arrow function declarations. By default
  the object is empty.
- `monorepo`: A boolean that specifies whether the plugin should automatically
  identify the tailwind config file. This should only be used when you have
  multiple tailwind config files in your project. If by any change you have a
  monorepo and yet you have one single tailwind config file, do not set this to
  `true` and use the `config` option instead.
- `removeDuplicates`: A boolean representing whether to remove duplicates from
  the given classes.
- `tags`: An array of strings representing the names of the tags that should be
  checked for class sorting. Similar to `callees`, but using template strings.

### Limitations with `config`

Due to changes in how the settings or rule configurations are parsed (see:
https://github.com/eslint/eslint/issues/17767), it is not possible to serialize
functions as part of the configuration. This means that through the `config`
settings/options it is not possible to parse the `plugins` option from Tailwind
config.  
If you want to use the `plugins`, define them in the `tailwind.config.{js,ts}`
file.
