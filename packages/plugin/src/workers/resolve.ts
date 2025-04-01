import pkg from 'enhanced-resolve';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const { CachedInputFileSystem, ResolverFactory } = pkg;

type ExpiringMap<K, V> = {
  get: (key: K) => undefined | V;
  set: (key: K, value: V) => void;
};
export const createExpiringMap = <K, V>(duration: number): ExpiringMap<K, V> => {
  const map = new Map<K, { value: V; expiration: Date }>();

  return {
    get(key: K) {
      const result = map.get(key);
      if (!result) {
        return undefined;
      }
      if (result.expiration <= new Date()) {
        map.delete(key);
        return undefined;
      }

      return result.value;
    },
    set(key: K, value: V) {
      const expiration = new Date();
      expiration.setMilliseconds(expiration.getMilliseconds() + duration);

      map.set(key, { expiration, value });
    }
  };
};

const fileSystem = new CachedInputFileSystem(fs, 30_000);

const esmResolver = ResolverFactory.createResolver({
  conditionNames: ['node', 'import'],
  extensions: ['.mjs', '.js'],
  fileSystem,
  mainFields: ['module'],
  useSyncFileSystemCalls: true
});
const cjsResolver = ResolverFactory.createResolver({
  conditionNames: ['node', 'require'],
  extensions: ['.js', '.cjs'],
  fileSystem,
  mainFields: ['main'],
  useSyncFileSystemCalls: true
});
const cssResolver = ResolverFactory.createResolver({
  conditionNames: ['style'],
  extensions: ['.css'],
  fileSystem,
  mainFields: ['style'],
  useSyncFileSystemCalls: true
});

// This is a long-lived cache for resolved modules whether they exist or not
// Because we're compatible with a large number of plugins, we need to check
// for the existence of a module before attempting to import it. This cache
// is used to mitigate the cost of that check because Node.js does not cache
// failed module resolutions making repeated checks very expensive.
const resolveCache = createExpiringMap<string, null | string>(30_000);

export const resolveCssFrom = (base: string, id: string) => cssResolver.resolveSync({}, base, id) || id;

export const resolveJsFrom = (base: string, id: string): string => {
  try {
    return esmResolver.resolveSync({}, base, id) || id;
  } catch {
    return cjsResolver.resolveSync({}, base, id) || id;
  }
};

export const maybeResolve = (name: string) => {
  let modpath = resolveCache.get(name);

  if (modpath === undefined) {
    try {
      modpath = resolveJsFrom(fileURLToPath(import.meta.url), name);
      resolveCache.set(name, modpath);
    } catch {
      resolveCache.set(name, null);
      return null;
    }
  }

  return modpath;
};

export const loadIfExists = async <T>(name: string): Promise<null | T> => {
  const modpath = maybeResolve(name);

  if (modpath) {
    const mod = await import(name);
    return mod.default ?? mod;
  }

  return null;
};

