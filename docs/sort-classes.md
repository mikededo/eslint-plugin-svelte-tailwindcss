# sort-classes

- [Rule source](../src/rules/sort-classes/rule.ts)
- [Test source](../src/rules/sort-classes/rule.test.ts)

## Description

The rule aims to provide an error when classes are not sorted according to
tailwind's internal defined order (see [_How classes are sorted_](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier#how-classes-are-sorted)).
The plugin uses the same algorithm as in `prettier-plugin-tailwindcss`.

### Configuration options

This rule accepts the following options:

- `callees`: An array of strings representing the names of the functions that
  should _also_ be checked for class sorting. By default, this value is `[]`.
  Callees used inside the `class` attribute are also checked for class sorting.
- `config`: A string representing the path of the Tailwind config file. By
  default checks the value from the `loadConfig` function provided from
  `tailwindcss`.
- `removeDuplicates`: A boolean representing whether to remove duplicates from
  the given classes.
- `tags`: An array of strings representing the names of the tags that should be
  checked for class sorting. Similar to `callees`, but using template strings.

> Options code source: [sort-classes/index.ts](../src/rules/sort-classes/source.ts#L10)

In case you define global options, there's no need to configure theme this rule,
unless you want to change the provided options.

### TS files

This rule can also be used in TypeScript and JavaScript files, yet the
`callees` option needs to be specified, so that the plugin knows which functions
should be evaluated.

## Examples

<details>
<summary>With default options</summary>

```javascript
// eslint.config.js
export default [
  /// ...
  {
    files: ["*.svelte"],
    parser: "svelte-eslint-parser",
    plugins: ["svelte-tailwindcss"],
    rules: {
      "svelte-tailwindcss/sort-classes": "error",
    },
    // ...
  },
];
```

```svelte
<!-- ❌ Classes not sorted -->
<div class="px-8 py-4 bg-blue-500"></div>
<!-- ✅ Classes sorted -->
<div class="bg-blue-500 px-8 py-4"></div>
```

</details>

<details>
<summary>With specific callee (<code>twMerge</code> or <code>clsx</code>)</summary>

```javascript
// eslint.config.js
export default [
  /// ...
  {
    files: ["*.svelte"],
    parser: "svelte-eslint-parser",
    plugins: ["svelte-tailwindcss"],
    rules: {
      "svelte-tailwindcss/sort-classes": [
        "error",
        { callees: ["twMerge", "clsx"] },
      ],
    },
    // ...
  },
];
```

```svelte
<!-- ❌ Classes not sorted -->
<div class={clsx("px-8 py-4 bg-blue-500")}></div>
<!-- ✅ Classes sorted -->
<div class={clsx("bg-blue-500 px-8 py-4")}></div>

<!-- Event when using templates inside strings -->
<!-- ❌ Classes not sorted -->
<div class="px-8 py-4 bg-blue-500" {twMerge("px-8 py-4 bg-blue-500", variable)}></div>
<!-- ✅ Classes sorted -->
<div class="bg-blue-500 px-8 py-4" {twMerge("bg-blue-500 px-8 py-4", variable)}></div>
```

</details>

<details>
<summary>Removing duplicates, as well as sorting</summary>

```javascript
// eslint.config.js
export default [
  /// ...
  {
    files: ["*.svelte"],
    parser: "svelte-eslint-parser",
    plugins: ["svelte-tailwindcss"],
    rules: {
      "svelte-tailwindcss/sort-classes": [
        "error",
        { callees: ["twMerge", "clsx"], removeDuplicates: true },
      ],
    },
    // ...
  },
];
```

```svelte
<!-- ❌ Classes not sorted -->
<div class="px-8 px-8 py-4 bg-blue-500"></div>
<!-- ✅ Classes sorted, and px-8 removed -->
<div class="bg-blue-500 px-8 py-4"></div>
```

</details>
