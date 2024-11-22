import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const RULES_DIR = './src/rules';
const OUTPUT_FILE = join(RULES_DIR, 'index.ts');

const camelCase = (value: string) => value
  .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  .replace(/^[A-Z]/, (c) => c.toLowerCase());

const generateRulesIndex = async () => {
  try {
    const entries = await readdir(RULES_DIR, { withFileTypes: true });
    const subDirs: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = join(RULES_DIR, entry.name);
        const files = await readdir(subdirPath);
        if (files.includes('rule.ts')) {
          subDirs.push(entry.name);
        }

        if (!files.includes('rule.test.ts')) {
          console.warn(`[WARN] Rule ${camelCase(entry.name)} does not include a test!`);
        }
      }
    }

    const sorted = subDirs.sort();
    const imports = sorted.map((dir) => `import ${camelCase(dir)} from './${dir}/rule';`).join('\n');
    const exports = `export default {\n${sorted.map(
      (dir, i, { length }) => `  '${dir}': ${camelCase(dir)}${i === length - 1 ? '' : ','}`
    ).join('\n')}\n};\n`;

    await writeFile(
      OUTPUT_FILE,
      `// This file is generated automatically by scripts/index.ts
// Do not edit this file manually

${imports}\n\n${exports}`
    );
    console.log(`[LOG] Rules index generated. Found rules: ${subDirs.length}`);
  } catch (error) {
    console.error(error);
  }
};

generateRulesIndex();