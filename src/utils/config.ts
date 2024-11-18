/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss';

import fs from 'node:fs';
import path from 'node:path';
import twResolveConfig from 'tailwindcss/resolveConfig';

const getLoadConfig = () => {
  try {
    return require('tailwindcss/lib/lib/load-config');
  } catch (_) {
    return null;
  }
};

const twLoadConfig = getLoadConfig();

/**
 * @see https://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate
 * @param {string} module The path to the module
 * @returns the module's export
 */
const requireUncached = (module: string) => {
  delete require.cache[require.resolve(module)];

  return twLoadConfig === null
    ? require(module) // Using native loading
    : twLoadConfig.loadConfig(module); // Using Tailwind CSS's loadConfig utility
};

let lastModifiedDate: string | null = null;
/**
 * Load the config from a path string or parsed from an object
 * @returns The config, `null` if the config file was not found, or an object
 * if the config was invalid
 */
const loadConfig = (config: string | Config): Config | null | object => {
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
    const mtime = `${stats.mtime || ''}`;

    if (stats === null) {
      // Default to no config
      return {};
    } else if (lastModifiedDate !== mtime) {
      // Load the config based on path
      lastModifiedDate = mtime;
      return requireUncached(resolvedPath);
    }

    // Unchanged config
    return null;
  } catch (_) {
    // Default to no config
    return {};
  }
};

const convertConfigToString = (config: string | Config | any) => {
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
let lastCheck: number | null = null;
let previousConfig: Config | null = null;
export const resolveConfig = (configPath: string) => {
  const newConfig = convertConfigToString(configPath) !== convertConfigToString(previousConfig);
  const now = Date.now();
  const expired = lastCheck !== null && now - lastCheck > CHECK_REFRESH_RATE;

  if (!newConfig && !expired) {
    return previousConfig;
  }

  lastCheck = now;

  const userConfig = loadConfig(configPath);

  // userConfig is null when config file was not modified
  if (userConfig !== null) {
    previousConfig = userConfig as Config;
    return twResolveConfig(userConfig as Config);
  }

  return null;
};

