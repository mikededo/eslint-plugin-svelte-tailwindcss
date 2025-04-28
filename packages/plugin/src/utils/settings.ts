import type { SVTPluginConfiguration, SVTRuleContext } from './types';

import { readdirSync } from 'node:fs';
import path from 'node:path';

import { getTailwindcssVersion } from './version';

// TODO: Update when v4. Valid v3 config files
const VALID_CONFIG_FILES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
  'tailwind.config.ts',
  'tailwind.config.cts',
  'tailwind.config.mts'
];

const DEFAULT_CONFIG: Required<SVTPluginConfiguration> = {
  callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv'],
  classRegex: '^class(Name)?$',
  config: './src/app.css',
  declarations: {},
  ignoredKeys: ['compoundVariants', 'defaultVariants'],
  monorepo: false,
  removeDuplicates: true,
  skipClassAttribute: false,
  tags: [],
  whitelist: []
};

const getParent = (pathname: string) => pathname.split(path.sep).slice(0, -1).join(path.sep);

const findParentConfigFile = (cwd: string, folder: string, config: string) => {
  if (!folder.startsWith(cwd)) {
    throw new Error(
      'Unable to find config file. `monorepo` setting was set to true, yet not tailwind configuration was found. Make sure you have a tailwind config file.'
    );
  }

  for (const current of readdirSync(folder)) {
    if (config === current) {
      return path.join(folder, config);
    }

    for (const valid of VALID_CONFIG_FILES) {
      if (valid === current) {
        return path.join(folder, valid);
      }
    }
  }

  return findParentConfigFile(cwd, path.dirname(folder), config);
};

export const getOption = <
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string,
  TKey extends keyof SVTPluginConfiguration
>(
  context: SVTRuleContext<TOptions, TMessageIds>,
  name: TKey
): NonNullable<SVTPluginConfiguration[TKey]> => {
  if (context.options && context.options.length) {
    if (context.options[0][name] !== undefined) {
      return context.options[0][name];
    }
  }

  if (context.settings.tailwindcss) {
    const settingValue = context.settings.tailwindcss[name];
    if (settingValue !== undefined) {
      return settingValue;
    }
  }

  return DEFAULT_CONFIG[name];
};

export const getMonorepoConfig = <
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string
>(
  context: SVTRuleContext<TOptions, TMessageIds>
): string => {
  if (getTailwindcssVersion(context.filename).major === 4) {
    throw new Error('The `monorepo` option is not allowed for v4');
  }

  const config = getOption(context, 'config');
  const fileFolder = getParent(context.filename);

  return findParentConfigFile(context.cwd, fileFolder, config);
};

