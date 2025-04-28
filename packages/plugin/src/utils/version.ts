import pkg from 'enhanced-resolve';
import fs, { readFileSync } from 'node:fs';

const { CachedInputFileSystem, ResolverFactory } = pkg;

const fileSystem = new CachedInputFileSystem(fs, 30_000);
const jsonResolver = ResolverFactory.createResolver({
  conditionNames: ['json'],
  extensions: ['.json'],
  fileSystem,
  useSyncFileSystemCalls: true
});

type SemVer = { patch: number; major: number; minor: number; identifier?: string };

const parseSemanticVersion = (version: string): SemVer => {
  const [major, minor, patchString] = version.split('.');
  const [patch, identifier] = patchString.split('-');

  return { identifier, major: +major, minor: +minor, patch: +patch };
};

const twVersionCache: Map<string, string> = new Map();

// TODO: Migrate to neverthrow
export const getTailwindcssVersion = (fileName: string) => {
  const cached = twVersionCache.get(fileName);
  if (cached) {
    return parseSemanticVersion(cached);
  }

  // eslint-disable-next-line node/prefer-global/process
  const packageJsonPath = jsonResolver.resolveSync({}, process.cwd(), 'tailwindcss/package.json');
  if (!packageJsonPath) {
    throw new Error('Could not find a Tailwind CSS package.json');
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  if (!packageJson) {
    throw new Error('Could not find a Tailwind CSS package.json');
  }

  const { version } = packageJson.version;
  twVersionCache.set(fileName, version);
  return parseSemanticVersion(version);
};

