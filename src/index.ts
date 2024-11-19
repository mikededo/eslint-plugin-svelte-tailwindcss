import type { ESLint, Linter } from 'eslint';

import { version } from '../package.json';
import rules from './rules';

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-svelte-tailwindcss',
    version
  },
  rules
};

export default plugin;

type RuleDefinitions = typeof rules;
export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions'];
};
export type Rules = {
  [K in keyof RuleDefinitions]: Linter.RuleEntry<RuleOptions[K]>;
};

