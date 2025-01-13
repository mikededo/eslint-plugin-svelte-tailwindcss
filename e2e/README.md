# e2e

The idea of these e2e is to simulate a real project in Svelte. The only thing
that's different is that the linter is created programatically (see
[`./run.test.ts`](./run.test.ts)).

The tests basically run the linter, from the result we extract only part of the
information and that is matched against a snapshot.

> In order to update the snapshots run `bun run --cwd e2e test:e2e -u`.  
> See [Vitest snapshot testing](https://vitest.dev/guide/snapshot#updating-snapshots)

While using the `RuleTester` is completely find and you can mock most of the
environments, I prefer having another environment in which I'm able to test as
if it were a real project.

## Running the tests

The test are implemented to be run with `e2e` being the cwd (current working
directory). In order to properly execute the tests, run:

```sh
bun run --cwd e2e test:e2e
```
