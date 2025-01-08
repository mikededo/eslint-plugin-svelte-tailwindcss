import type { ScopeManager } from '@typescript-eslint/scope-manager';
import type { NamedCreateRuleMeta, RuleListener, RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils';
import type { JSONSchema4, JSONSchema4ObjectSchema } from '@typescript-eslint/utils/json-schema';
import type { SharedConfigurationSettings, RuleContext as TSRuleContext } from '@typescript-eslint/utils/ts-eslint';
import type { SourceCode as ESLintSourceCode, Rule } from 'eslint';
import type { AST, StyleContext, SvelteConfig } from 'svelte-eslint-parser';
import type TS from 'typescript';

export type LegacyTailwindContext = {
  layerOrder: { components: bigint };
  tailwindConfig: {
    prefix: ((selector: string) => string) | string;
  };
  getClassOrder?: (classList: string[]) => [string, bigint | null][];
};

export type SVTNodeOrToken = {
  type: string;
  range?: [number, number];
  loc?: AST.SourceLocation | null;
};
/**
 * Intended usage:
 *
 * ```javascript
 *  // eslint.config.js
 *  export default [{
 *    settings: {
 *      tailwindcss: {
 *        // These are the default values but feel free to customize
 *        callees: ["classnames", "clsx", "ctl"],
 *        config: "tailwind.config.js",
 *        cssFiles: [
 *          "**\/*.css",
 *          "!**\/node_modules",
 *          "!**\/.*",
 *          "!**\/dist",
 *          "!**\/build",
 *        ],
 *        cssFilesRefreshRate: 5_000,
 *        removeDuplicates: true,
 *        skipClassAttribute: false,
 *        whitelist: [],
 *        tags: [],
 *        ignoredKeys: ['compoundVariants', 'defaultVariants'],
 *        classRegex: undefined,
 *      },
 *    },
 * }];
 * ```
 */
export type SVTPluginConfiguration = {
  callees?: string[];
  /**
   * Can be modified to support custom attributes. E.g. "^tw$" for `twin.macro`
   */
  classRegex?: string;
  // TODO: Implement
  skipClassAttribute?: boolean;
  /**
   * TODO: Implement TaggedExpression
   * Can be set to e.g. ['tw'] for use in tw`bg-blue`
   */
  tags?: string[];
  whitelist?: string[];
  /**
   * Returned from `loadConfig()` utility if not provided
   */
  config?: string;
  // TODO: Implement
  ignoredKeys?: string[];
  /**
   * If set to true, in order to find the tailwind config file, the plugin will
   * traverse up the directory tree until it finds a valid tailwind config
   * file. This will ignore the `config` option, for simplicity.
   * The check will be done always upwards, at folder level, without digging
   * into each nested folder.
   *
   * Important to note that the traverse will go as high to as
   * [`RuleContext#cwd`](https://github.com/typescript-eslint/typescript-eslint/blob/c1b1106da2807646c6579ddad2c8452db78eb9c6/packages/utils/src/ts-eslint/Rule.ts#L262-L266)
   */
  monorepo?: boolean;
  /**
   * If set to `true`, the plugin will remove duplicate classes from the final
   * class attribute.
   */
  removeDuplicates?: boolean;
};
export type SVTPluginOptions = Partial<SVTPluginConfiguration>;
export type SVTReportDescriptor = SVTReportDescriptorLocation &
  SVTReportDescriptorMessage &
  SVTReportDescriptorOptions;
export type SVTRuleContext<
  TOptions extends readonly unknown[],
  TMessageIds extends string
> = Readonly<
  {
    // Override the custom settings so that they are type safe accross rules
    settings: { tailwindcss?: SVTPluginConfiguration } & SharedConfigurationSettings;
    // Override report to include Svelte parser types
    report: (descriptor: SVTReportDescriptor) => void;
    // Override SourceCode to include Svelte parser types
    sourceCode: Readonly<SVTSourceCode>;
  } &
  Exclude<TSRuleContext<TMessageIds, TOptions>, 'report' | 'settings' | 'sourceCode'>
>;
export type SVTRuleFixer = {
  insertTextAfter: (nodeOrToken: SVTNodeOrToken, text: string) => Rule.Fix;

  insertTextAfterRange: (range: AST.Range, text: string) => Rule.Fix;

  insertTextBefore: (nodeOrToken: SVTNodeOrToken, text: string) => Rule.Fix;

  insertTextBeforeRange: (range: AST.Range, text: string) => Rule.Fix;

  remove: (nodeOrToken: SVTNodeOrToken) => Rule.Fix;

  removeRange: (range: AST.Range) => Rule.Fix;

  replaceText: (nodeOrToken: SVTNodeOrToken, text: string) => Rule.Fix;

  replaceTextRange: (range: AST.Range, text: string) => Rule.Fix;
};
export type SVTRuleMeta<
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string,
  TDocs = unknown
> = {
  /**
   * We override the current `create` method to ensure the `SourceCode`
   * includes all Svelte AST nodes and methods work with Svelte's AST.
   */
  create: (context: SVTRuleContext<TOptions, TMessageIds>, optionsWithDefault: Readonly<TOptions>) => RuleListener;
  meta: {
    /**
     * Ensure the schema is type safe with all the available options.
     */
    schema: ({
      properties?: Record<keyof TOptions[number], JSONSchema4>;
    } & Omit<JSONSchema4ObjectSchema, 'properties'>)[];
  } & NamedCreateRuleMeta<TMessageIds, TDocs>;
} & Omit<RuleWithMetaAndName<TOptions, TMessageIds>, 'create'>;

export type SVTRuleModule<
  T extends readonly Partial<SVTPluginConfiguration>[]
> = { defaultOptions: T } & Rule.RuleModule;

export type SVTSourceCode = {
  ast: AST.SvelteProgram;
  hasBOM: boolean;
  lines: string[];
  text: string;
  scopeManager: ScopeManager;
  visitorKeys: ESLintSourceCode.VisitorKeys;
  parserServices: {
    [key: string]: unknown;
    getSvelteHtmlAst?: () => unknown;
    isSvelte?: boolean;
    isSvelteScript?: boolean;
    esTreeNodeToTSNodeMap?: ReadonlyMap<unknown, TS.Node>;
    getStyleContext?: () => StyleContext;
    hasFullTypeInformation?: boolean; // Old typescript-eslint
    program?: TS.Program;
    svelteParseContext?: {
      /**
       * Whether to use Runes mode.
       * May be `true` if the user is using Svelte v5.
       * Resolved from `svelte.config.js` or `parserOptions`, but may be overridden by `<svelte:options>`.
       */
      runes?: boolean;
      /** The version of "svelte/compiler". */
      compilerVersion?: string;
      /** The result of static analysis of `svelte.config.js`. */
      svelteConfig?: null | SvelteConfig;
    };
  };

  getText: (node?: SVTNodeOrToken, beforeCount?: number, afterCount?: number) => string;

  getLines: () => string[];

  getAllComments: () => AST.Comment[];

  getComments: (node: SVTNodeOrToken) => {
    leading: AST.Comment[];
    trailing: AST.Comment[];
  };

  getJSDocComment: (node: SVTNodeOrToken) => AST.Comment | null;

  isSpaceBetweenTokens: (first: AST.Token, second: AST.Token) => boolean;

  getLocFromIndex: (index: number) => AST.Position;

  getIndexFromLoc: (location: AST.Position) => number;

  // Inherited methods from TokenStore
  getTokenByRangeStart: (
    offset: number,
    options?: { includeComments?: boolean }
  ) => AST.Comment | AST.Token | null;

  getFirstToken: ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstToken']>[1]
  ) => AST.Comment | AST.Token | null) & ((node: SVTNodeOrToken) => AST.Token);

  getFirstTokens: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokens']>[1]
  ) => (AST.Comment | AST.Token)[];

  getLastToken: ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastToken']>[1]
  ) => AST.Comment | AST.Token | null) & ((node: SVTNodeOrToken) => AST.Token);

  getLastTokens: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokens']>[1]
  ) => (AST.Comment | AST.Token)[];

  getTokenBefore: ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokenBefore']>[1]
  ) => AST.Comment | AST.Token | null) & ((node: SVTNodeOrToken) => AST.Token | null);

  getTokensBefore: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokensBefore']>[1]
  ) => (AST.Comment | AST.Token)[];

  getTokenAfter: ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokenAfter']>[1]
  ) => AST.Comment | AST.Token | null) & ((node: SVTNodeOrToken) => AST.Token | null);

  getTokensAfter: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokensAfter']>[1]
  ) => (AST.Comment | AST.Token)[];

  getFirstTokenBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokenBetween']>[2]
  ) => AST.Comment | AST.Token | null;

  getFirstTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokensBetween']>[2]
  ) => (AST.Comment | AST.Token)[];

  getLastTokenBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokenBetween']>[2]
  ) => AST.Comment | AST.Token | null;

  getLastTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokensBetween']>[2]
  ) => (AST.Comment | AST.Token)[];

  getTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    padding?: Parameters<ESLintSourceCode['getTokensBetween']>[2]
  ) => (AST.Comment | AST.Token)[];

  getTokens: ((node: SVTNodeOrToken, beforeCount?: number, afterCount?: number) => AST.Token[]) & ((
    node: SVTNodeOrToken,
    options: Parameters<ESLintSourceCode['getTokens']>[1]
  ) => (AST.Comment | AST.Token)[]);

  commentsExistBetween: (left: SVTNodeOrToken, right: SVTNodeOrToken) => boolean;

  getCommentsBefore: (nodeOrToken: AST.Token | SVTNodeOrToken) => AST.Comment[];

  getCommentsAfter: (nodeOrToken: AST.Token | SVTNodeOrToken) => AST.Comment[];

  getCommentsInside: (node: SVTNodeOrToken) => AST.Comment[];
};

type SVTReportDescriptorLocation =
  | { loc: { line: number; column: number } | AST.SourceLocation }
  | { node: SVTNodeOrToken };
type SVTReportDescriptorMessage = { message: string } | { messageId: string };

type SVTReportDescriptorOptions = {
  suggest?: null | SVTSuggestionReportDescriptor[];
} & SVTReportDescriptorOptionsBase;
type SVTReportDescriptorOptionsBase = {
  data?: { [key: string]: string };
  fix?: ((fixer: SVTRuleFixer) => IterableIterator<Rule.Fix> | null | Rule.Fix | Rule.Fix[]) | null;
};

type SVTSuggestionDescriptorMessage = { desc: string } | { messageId: string };

type SVTSuggestionReportDescriptor = SVTReportDescriptorOptionsBase & SVTSuggestionDescriptorMessage;
