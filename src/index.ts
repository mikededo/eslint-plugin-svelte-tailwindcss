import type { ESLint } from "eslint";

import { version } from '../package.json';

const plugin: ESLint.Plugin = {
  meta: {
    name: "eslint-plugin-svelte-tailwindcss",
    version
  }
}

export default plugin;

