# eslint-plugin-svelte-tailwindcss

## 0.1.0-next.8

### Minor Changes

- Add `VariableDeclarator` listener in order to parse variables and similar. ([#25](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/25))

### Patch Changes

- Add support fort `BinaryExpressions` ([#25](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/25))

## 0.1.0-next.7

### Minor Changes

- Remove support for ESLint versions previous to v9. ([#20](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/20))

### Patch Changes

- Update docs ([`518dc9c`](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/commit/518dc9c20abe8004326972eacb61fdaac62376f9))

- Update minor issues with `no-literal-mustache-mix`. ([#20](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/20))

## 0.1.0-next.6

### Minor Changes

- Improve `sort-classes` implementation as well as fixing a couple of issues with ([#19](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/19))
  `CallExpressions` inside the `html` code of the template.

- Support `CallExpression` for `sort-classes` rule ([#15](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/15))

### Patch Changes

- Tests improvements, docs fixes and other small fixes/improvements. ([#19](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/19))

- Remove unnecessary configuration inherited from `eslint-plugin-tailwindcss`. ([#19](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/19))

- Add `@typescript-eslint/types` in `externals` ([#16](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/16))

## 0.1.0-next.5

### Minor Changes

- Add `at-rules-require-postcss` ([#12](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/12))

### Patch Changes

- Update dependencies ([#14](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/14))

## 0.1.0-next.4

### Minor Changes

- Adds support for `monrepo` setups (i.e. for multiple `tailwind.config.*` files. ([#10](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/10))

## 0.1.0-next.3

### Patch Changes

- Corrected configs & other issues ([`0a57510`](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/commit/0a57510df5462f1fbad656773f903f505998d6a4))

## 0.1.0-next.2

### Patch Changes

- Minor config changes, to see if bundling goes right ([`c57f11b`](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/commit/c57f11b423b05cdcf4afe271c0be5c312c894632))

- Update default changeset commit ([`28aacf6`](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/commit/28aacf68571eb4fd18c0f924dbce510bfd3a0699))

## 0.1.0-next.1

### Patch Changes

- Add tailwindcss as external when bundling ([`86cf91e`](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/commit/86cf91eeea7cd6a1402e42bdd701b1897ae80aeb))

## 0.1.0-next.0

### Minor Changes

- Added new `no-literal-mustache-mix` rule ([#3](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/3))

- Exports base flat and legacy configs ([#6](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/6))

### Patch Changes

- Improved current generation scripts & other dx improvements ([#4](https://github.com/mikededo/eslint-plugin-svelte-tailwindcss/pull/4))
