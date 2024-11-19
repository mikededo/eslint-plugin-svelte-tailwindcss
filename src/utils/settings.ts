import type { SVTPluginConfiguration, SVTRuleContext } from './types';

const getDefaultConfigPathAlias = (): (() => string) | null => {
  try {
    // @ts-expect-error Specific tailwindcss API
    const { resolveDefaultConfigPath } = import('tailwindcss/lib/util/resolveConfigPath');
    return resolveDefaultConfigPath;
  } catch (_) {
    return null;
  }
};
const resolveDefaultConfigPathAlias = getDefaultConfigPathAlias();

const DEFAULT_CONFIG: Required<SVTPluginConfiguration> = {
  callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv'],
  classRegex: '^class(Name)?$',
  config: resolveDefaultConfigPathAlias?.() ?? 'tailwind.config.js',
  cssFiles: ['**/*.css', '!**/node_modules', '!**/.*', '!**/dist', '!**/build'],
  cssFilesRefreshRate: 5_000,
  ignoredKeys: ['compoundVariants', 'defaultVariants'],
  removeDuplicates: true,
  skipClassAttribute: false,
  tags: [],
  whitelist: []
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

  if (context.settings.taildwindcss) {
    const settingValue = context.settings.taildwindcss[name];
    if (settingValue !== undefined) {
      return settingValue;
    }
  }

  return DEFAULT_CONFIG[name];
};
