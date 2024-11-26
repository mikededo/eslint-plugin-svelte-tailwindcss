
import type { Config } from 'tailwindcss';

import fs from 'node:fs';
import path from 'node:path';
import defaultConfig from 'tailwindcss/defaultConfig.js';
import twResolveConfig from 'tailwindcss/resolveConfig.js';
// @ts-expect-error Specific Tailwind API
import loadConfigModule from 'tailwindcss/lib/lib/load-config.js';

export type ResolvedConfig = NonNullable<ReturnType<typeof twResolveConfig>>;

const { loadConfig: twLoadConfig } = loadConfigModule;

let lastModifiedDate: null | string = null;
/**
 * Load the config from a path string or parsed from an object
 * @returns The config, `null` if the config file was not found, or an object
 * if the config was invalid
 */
const loadConfig = (config: Config | string): Config | null | object => {
  if (typeof config === 'object' && config !== null) {
    return config;
  }
  if (typeof config !== 'string') {
    return {};
  }

  const resolvedPath = path.isAbsolute(config)
    ? config
    : path.join(path.resolve(), config);

  try {
    const stats = fs.statSync(resolvedPath);
    if (stats === null) {
      // Default to no config
      return {};
    }

    const mtime = `${stats.mtime || ''}`;
    if (lastModifiedDate !== mtime) {
      // Load the config based on path
      lastModifiedDate = mtime;
      return twLoadConfig(resolvedPath);
    }

    // Unchanged config
    return null;
  } catch (_) {
    // Default to no config
    return {};
  }
};

const convertConfigToString = (config: any | Config | string) => {
  if (typeof config === 'string') {
    return config;
  }
  if (typeof config === 'object') {
    return JSON.stringify(config);
  }
  if ('toString' in config) {
    return config.toString();
  }

  throw new Error('Cannot convert config into string');
};

const CHECK_REFRESH_RATE = 1_000;
let lastCheck: null | number = null;
let previousConfig: Config | null = null;
let previousConfigPath: null | string = null;
let previouslyResolvedConfig: null | ResolvedConfig = null;
export const resolveConfig = (configPath: string): ResolvedConfig => {
  const newConfig = configPath !== previousConfigPath;
  const now = Date.now();
  const expired = lastCheck !== null && now - lastCheck > CHECK_REFRESH_RATE;

  if (!newConfig && !expired && previouslyResolvedConfig) {
    return previouslyResolvedConfig;
  }

  lastCheck = now;
  previousConfigPath = configPath;

  const userConfig = loadConfig(configPath);
  const areConfigsEqual = convertConfigToString(userConfig) === convertConfigToString(previousConfig);
  if (areConfigsEqual && previouslyResolvedConfig) {
    return previouslyResolvedConfig;
  }

  // userConfig is null when config file was not modified
  if (userConfig !== null) {
    previousConfig = userConfig as Config;
    const resolvedConfig = twResolveConfig(userConfig as Config);
    if (resolvedConfig !== null || !Object.keys(resolvedConfig).length) {
      previouslyResolvedConfig = resolvedConfig;
      return resolvedConfig;
    }
  }

  // In case there's no config file, we return the default config provided by
  // tailwindcss
  return twResolveConfig(defaultConfig);
};

