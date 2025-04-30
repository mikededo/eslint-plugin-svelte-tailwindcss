/* eslint-disable node/prefer-global/process */

import type { ContextContainer } from '../utils/types';

import clearModule from 'clear-module';
import escalade from 'escalade/sync';
import { createJiti, type Jiti } from 'jiti';
// @ts-check
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import { runAsWorker } from 'synckit';
// @ts-expect-error Cannot find the declarations
import { generateRules as generateRulesFallback } from 'tailwindcss/lib/lib/generateRules.js';
// @ts-expect-error Cannot find the declarations
import { createContext as createContextFallback } from 'tailwindcss/lib/lib/setupContextUtils.js';
import loadConfigFallback from 'tailwindcss/loadConfig.js';
import resolveConfigFallback from 'tailwindcss/resolveConfig.js';
import type { RequiredConfig } from 'tailwindcss/types/config.js';

import { createExpiringMap, resolveCssFrom, resolveJsFrom } from './resolve';

const sourceToPathMap = new Map<string, null | string>();
const sourceToEntryMap = new Map<string, null | string>();
const pathToContextMap = createExpiringMap<null | string, ContextContainer>(10_000);

/**
 * Create a loader function that can load plugins and config files relative to
 * the CSS file that uses them. However, we don't want missing files to prevent
 * everything from working so we'll let the error handler decide how to proceed.
 */
const createLoader = <T>({
  filepath,
  jiti,
  legacy,
  onError
}: {
  filepath: string;
  jiti: Jiti;
  legacy: boolean;
  onError: (id: string, error: unknown, resourceType: string) => T;
}) => {
  const cacheKey = `${+Date.now()}`;

  const loadFile = async (id: string, base: string, resourceType: string) => {
    try {
      const resolved = resolveJsFrom(base, id);

      const url = pathToFileURL(resolved);
      url.searchParams.append('t', cacheKey);

      return await jiti.import(url.href, { default: true });
    } catch (err) {
      return onError(id, err, resourceType);
    }
  };

  if (legacy) {
    const baseDir = path.dirname(filepath);
    return (id: string) => loadFile(id, baseDir, 'module');
  }

  return async (id: string, base: string, resourceType: string) => ({
    base,
    module: await loadFile(id, base, resourceType)
  });
};

const getBaseDir = (filePath: string): string => filePath
  ? path.dirname(filePath)
  : process.cwd();

const getConfigPath = (twConfigPath: string, baseDir: string): null | string => {
  if (twConfigPath) {
    if (twConfigPath.endsWith('.css')) {
      return null;
    }

    return path.resolve(baseDir, twConfigPath);
  }

  try {
    return escalade(baseDir, (_dir, names) => {
      const configFiles = [
        'tailwind.config.js',
        'tailwind.config.cjs',
        'tailwind.config.mjs',
        'tailwind.config.ts'
      ];
      return configFiles.find((file) => names.includes(file));
    }) ?? null;
  } catch {
    return null;
  }
};

const loadV4 = async (baseDir: string, pkgDir: string, entryPoint: null | string) => {
  // Import Tailwind — if this is v4 it'll have APIs we can use directly
  const pkgPath = resolveJsFrom(baseDir, 'tailwindcss');

  const tw = await import(pathToFileURL(pkgPath).toString());

  // This is not Tailwind v4
  if (!tw.__unstable__loadDesignSystem) {
    return null;
  }

  // If the user doesn't define an entrypoint then we use the default theme
  entryPoint = entryPoint ?? `${pkgDir}/theme.css`;

  // Create a Jiti instance that can be used to load plugins and config files
  const jiti = createJiti(import.meta.url, {
    fsCache: false,
    moduleCache: false
  });

  const importBasePath = path.dirname(entryPoint);

  // Resolve imports in the entrypoint to a flat CSS tree
  let css = await fs.readFile(entryPoint, 'utf-8');

  // Determine if the v4 API supports resolving `@import`
  let supportsImports = false;
  try {
    await tw.__unstable__loadDesignSystem('@import "./empty";', {
      loadStylesheet: () => {
        supportsImports = true;
        return { base: importBasePath, content: '' };
      }
    });
  } catch {}

  if (!supportsImports) {
    const resolveImports = postcss([postcssImport()]);
    const result = await resolveImports.process(css, { from: entryPoint });
    css = result.css;
  }

  // Load the design system and set up a compatible context object that is
  // usable by the rest of the plugin
  const design = await tw.__unstable__loadDesignSystem(css, {
    base: importBasePath,
    loadConfig: createLoader({
      filepath: entryPoint,
      jiti,
      legacy: true,
      onError(id, err) {
        console.error(`Unable to load config: ${id}`, err);

        return {};
      }
    }),

    // v4.0.0-alpha.25+
    loadModule: createLoader({
      filepath: entryPoint,
      jiti,
      legacy: false,
      onError: (id, err, resourceType) => {
        console.error(`Unable to load ${resourceType}: ${id}`, err);

        if (resourceType === 'config') {
          return {};
        }

        return () => {};
      }
    }),

    // v4.0.0-alpha.24 and below
    loadPlugin: createLoader({
      filepath: entryPoint,
      jiti,
      legacy: true,
      onError(id, err) {
        console.error(`Unable to load plugin: ${id}`, err);
        return () => {};
      }
    }),

    loadStylesheet: async (id: string, base: string) => {
      const resolved = resolveCssFrom(base, id);

      return {
        base: path.dirname(resolved),
        content: await fs.readFile(resolved, 'utf-8')
      };
    }
  });

  return {
    context: {
      getClassOrder: (classList: string[]) => design.getClassOrder(classList)
    },
    // Stubs that are not needed for v4
    generateRules: () => []
  };
};

const loadTailwindConfig = async (
  baseDir: string,
  tailwindConfigPath: null | string,
  entryPoint: null | string
): Promise<ContextContainer> => {
  let createContext = createContextFallback;
  let generateRules = generateRulesFallback;
  let resolveConfig = resolveConfigFallback;
  let loadConfig = loadConfigFallback;
  let tailwindConfig: RequiredConfig = { content: [] };

  try {
    const pkgFile = resolveJsFrom(baseDir, 'tailwindcss/package.json');
    const pkgDir = path.dirname(pkgFile);

    try {
      const v4 = await loadV4(baseDir, pkgDir, entryPoint);
      if (v4) {
        return v4;
      }
    } catch {}

    resolveConfig = await import(path.join(pkgDir, 'resolveConfig'));
    createContext = (await import(path.join(pkgDir, 'lib/lib/setupContextUtils'))).createContext;
    generateRules = (await import(path.join(pkgDir, 'lib/lib/generateRules'))).generateRules;

    // Prior to `tailwindcss@3.3.0` this won't exist so we load it last
    loadConfig = await import(path.join(pkgDir, 'loadConfig'));
  } catch {}

  if (tailwindConfigPath) {
    clearModule(tailwindConfigPath);
    const loadedConfig = loadConfig(tailwindConfigPath);
    tailwindConfig = loadedConfig.default ?? loadedConfig;
  }

  // suppress "empty content" warning
  tailwindConfig.content = ['no-op'];

  return { context: createContext(resolveConfig(tailwindConfig)), generateRules };
};

runAsWorker(async (filePath: string, classes: string[]): Promise<any> => {
  const baseDir = getBaseDir(filePath);

  // Map the source file to it's associated Tailwind config file
  const configPath = sourceToPathMap.get(filePath) ?? getConfigPath(filePath, baseDir);
  sourceToPathMap.set(filePath, configPath);

  const entryPoint = sourceToEntryMap.get(filePath) ?? filePath;
  sourceToEntryMap.set(filePath, entryPoint);

  // Now see if we've loaded the Tailwind config file before (and it's still valid)
  const contextKey = `${configPath}:${entryPoint}`;
  const existing = pathToContextMap.get(contextKey);
  if (existing) {
    return existing.context.getClassOrder(classes);
  }

  // By this point we know we need to load the Tailwind config file
  const result = await loadTailwindConfig(baseDir, configPath, entryPoint);

  pathToContextMap.set(contextKey, result);
  return result.context.getClassOrder(classes);
});
