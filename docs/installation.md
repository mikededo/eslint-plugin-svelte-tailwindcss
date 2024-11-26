# Installation

In order to get started, install the plugin alongside
[`svelte-eslint-parser`](https://github.com/sveltejs/eslint-plugin-svelte). This
assumes that you already have `eslint` and `tailwdincss` installed.

You can use the package manager of your choice.

```bash
bun add -d eslint-plugin-svelte-tailwindcss@next svelte-eslint-parser
```

## Configuration

The plugin only provides two base configurations, one for flat confi (ESLint >=
v9) and one for regular configurations (ESLint < v9).

```javascript
// eslint.config.js
import pluginSvelteTailwindcss from 'eslint-plugin-svelte-tailwindcss';

export default [
  pluginSvelteTailwindcss['flat/base']
];


// If you want to customise the options
export default [
  ...svelteTailwind.configs['flat/base'],
  {
    rules: {
      'svelte-tailwindcss/sort-classes': ['warn']
    }
  }
]


// You can also provide customise ESLint settings, so the options would be
// available for all rules
export default [
  ...svelteTailwind.configs['flat/base'],
  {
    settings: { monorepo: true }
  }
]
```

## Options

Here's the list of options available for the plugin:

- `callees`: An array of strings representing the names of the functions that
  should _also_ be checked for class sorting. By default, this value is `[]`.
  Callees used inside the `class` attribute are also checked for class sorting.
- `config`: A string representing the path of the Tailwind config file. By
  default checks the value from the `loadConfig` function provided from
  `tailwindcss`.
- `monorepo`: A boolean that specifies whether the plugin should automatically
  identify the tailwind config file. This should only be used when you have
  multiple tailwind config files in your project. If by any change you have a
  monorepo and yet you have one single tailwind config file, do not set this to
  `true` and use the `config` option instead.
- `removeDuplicates`: A boolean representing whether to remove duplicates from
  the given classes.
- `tags`: An array of strings representing the names of the tags that should be
  checked for class sorting. Similar to `callees`, but using template strings.
