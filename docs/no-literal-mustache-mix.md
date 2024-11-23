# no-literal-mustache-mix

- [Rule source](../src/rules/no-literal-mustache-mix/rule.ts)
- [Test source](../src/rules/no-literal-mustache-mix/rule.test.ts)

## Description

The rule aims to provide an error when there's a mix of literal and mustache
interpolations in the same template. Usually, literals will be joined at the
beginning, and mustaches at the end. However, if the starting expression is a
mustache, the order will be reversed.

### Configuration options

This rules does not accept any options, not global options affect this rule.

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
      "svelte-tailwindcss/no-literal-mustache-mix": "error",
    },
    // ...
  },
];
```

```svelte
<!-- ❌ Literal and mustache interpolations -->
<div class="bg-blue-500 {twMerge("px-8")} py-4"></div>
<!-- ✅ Literal interpolation -->
<div class="bg-blue-500 py-4 {twMerge("px-8")}"></div>
```

</details>
