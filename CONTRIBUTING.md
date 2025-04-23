# Contributing

When contributing to this repository, please first discuss the change you wish
to make via issue or pull request, before making a change.

Please note we have a [code of conduct](./CODE_OF_CONDUCT.md), please follow it
in all your interactions with the project.

## Development

This project uses `pnpm` to manage dependencies so make sure you are using the
same version as the one in `package.json`. I also recommend using [`ni`](https://github.com/antfu-collective/ni)
and enabling `corepack` with `corepack enable`. This way you'll always be using
the right package manager when you run commands. See more info regarding
`corepack` in [here](https://nodejs.org/api/corepack.html).

### Creating a new rule

To create a new rule, you can use the `pnpm gen:rule` command.

### Linting/formatting

This project uses only `eslint` for both linting and formatting. In case you
want to format on save, update the following settings in your editor:

<details>
<summary>Noevim</summary>

```lua
-- Using conform
vim.api.nvim_create_autocmd('BufWritePre', {
  pattern = '*',
  callback = function(args)
    require('conform').format({ bufnr = args.buf })
  end,
  group = vim.api.nvim_create_augroup('EslintFixAll', { clear = true }),
})

-- Using eslint lsp
lspconfig.eslint.setup({
  --- ...
  on_attach = function(client, bufnr)
    vim.api.nvim_create_autocmd("BufWritePre", {
      buffer = bufnr,
      command = "EslintFixAll",
    })
  end,
})
```

You can also use [`none-ls`](https://github.com/nvimtools/none-ls.nvim) or
[`nvim-lint`](https://github.com/nvimtools/none-ls.nvim).

</details>

<details>
<summary>VSCode</summary>
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": false,
    "source.fixAll.eslint": true
  }
}
```
</details>

#### No prettier

Since ESLint is already configured to format the code, there is no need to
duplicate the functionality with Prettier. Also, it is an opinionated decision
based on `@antfu`'s article: [Why I don't use prettier](https://antfu.me/posts/why-not-prettier).

### Testing

This project is configured to use `vitest` for testing. Its strongly recommended
that you also check for the coverage of the added code (with `pnpm -r test:cov`).
Not only it can help you find out possible missing tests, but even redundant
code that could be removed, safely. However, there's no required threshold for
the coverage.

## Pull request

- Create a pull request with a meaningful title and description. Ensure your
  code is properly tested.
- In case your PR is related to an issue, use one of the following [GitHub
  keywords](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)
  to link pull requests to the issues.
- Create a changeset with your changes through `pnpm changeset`. Commit the
  changeset with `chore: add changeset` as the commit message.
- Once approved, the PR will be merged using the `rebase` strategy.
