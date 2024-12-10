import type { ESLint, Linter } from 'eslint';

import { name as packageName, version } from '../package.json';
import flatConfig from './configs/flat';
import legacyConfig from './configs/legacy';
import rules from './rules';

const plugin: ESLint.Plugin = {
  configs: {
    base: legacyConfig,
    'flat/base': flatConfig
  },
  meta: {
    name: packageName,
    version
  },
  rules
};

export default plugin;

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions'];
};
export type Rules = {
  [K in keyof RuleDefinitions]: Linter.RuleEntry<RuleOptions[K]>;
};
type RuleDefinitions = typeof rules;

