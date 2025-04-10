import { InvalidArgumentError, Option, program } from 'commander';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const validRuleName = (name: unknown) => {
  if (typeof name !== 'string') {
    throw new InvalidArgumentError('Rule name must be a string.');
  }

  if (/\d/.test(name)) {
    throw new InvalidArgumentError('Rule name cannot contain numbers.');
  }

  return name.toLowerCase().replaceAll(' ', '_');
};

program
  .description('Create a new rule')
  .argument('<name>', 'Valid ESLint rule name. Ej. "sort-classes"', validRuleName)
  .option('-d <description>', 'Rule description')
  .addOption(new Option('--fixable <type>', 'The fixable type of the rule').choices(['code', 'whitespace']))
  .addOption(
    new Option('--type <type>', 'Type of the rule')
      .choices(['suggestion', 'layout', 'problem'])
      .default('suggestion')
  )
  .addOption(
    new Option('-o, --options <options...>', 'Rule options from SVTPluginOptions')
      .choices([
        'callees',
        'classRegex',
        'config',
        'ignoredKeys',
        'removeDuplicates',
        'tags',
        'whitelist'
      ])
  )
  .option('-m, --messages <messages...>', 'Rule message ids')
  .option('--docs', 'With rule documentation', true)
  .showHelpAfterError();
program.parse();

const [ruleName] = program.processedArgs as string[];

// Generate the rule structure
const RULES_DIR = './src/rules';

const { description, fixable, messages = [], options = [], type: ruleType } = program.opts();
const ruleFolderName = ruleName.replaceAll('_', '-');
const ruleDir = `${RULES_DIR}/${ruleFolderName}`;

const RULE_TEMPLATE = `import type { SVTPluginOptions } from '../../utils';

import { createNamedRule } from '../../utils';

${options.length
  ? `export type Options = Pick<
  SVTPluginOptions,
  ${options.map((opt: string) => `'${opt}'`).join(' | ')}
>;
export type OptionList = Options[];
`
  : 'export type OptionList = [];'}
// Fill this type with the message ids
export type MessageIds = ${messages.length ? messages.map((msg: string) => `'${msg}'`).join(' | ') : '\'\''};

export default createNamedRule<OptionList, MessageIds>({
  create(context) {
    // Add rule logic...
  },
  defaultOptions: [
    // Configure here the default options, if any
  ],
  meta: {
    docs: {
      description: '${description}'
    },
    ${fixable ? `fixable: '${fixable}',` : ''}
    messages: {
      // Add message ids here - note minimum one message is required
      ${messages.map((msg: string) => `'${msg}': '',`).join('\n      ')}
    },
    schema: [{
      properties:
      {
        ${options.map((opt: string) => `${opt}: {}`).join(',\n        ')} 
      },
      type: 'object'
    }],
    type: '${ruleType}'
  },
  name: '${ruleName}'
});
`;

const generateRule = async () => {
  try {
    const entries = await readdir(RULES_DIR, { withFileTypes: true });
    const iof = entries.findIndex((entry) => entry.name === ruleFolderName);
    if (iof !== -1) {
      throw new Error(`Rule "${ruleName} already exists`);
    }

    await mkdir(ruleDir);
    await writeFile(join(ruleDir, 'rule.ts'), RULE_TEMPLATE);
    console.log(`[LOG] Rule "${ruleName}" created`);

    // TODO: Add rule docs
  } catch (error) {
    console.error(error);
  }
};

generateRule();
