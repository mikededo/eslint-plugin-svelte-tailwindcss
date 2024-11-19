import type { ScopeManager } from '@typescript-eslint/scope-manager';
import type { NamedCreateRuleMeta, RuleListener, RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils';
import type { JSONSchema4, JSONSchema4ObjectSchema } from '@typescript-eslint/utils/json-schema';
import type { SharedConfigurationSettings, RuleContext as TSRuleContext } from '@typescript-eslint/utils/ts-eslint';
import type { SourceCode as ESLintSourceCode, Rule } from 'eslint';
import type { AST, StyleContext, SvelteConfig } from 'svelte-eslint-parser';
import type TS from 'typescript';

export type SVTNodeOrToken = {
  type: string;
  loc?: AST.SourceLocation | null;
  range?: [number, number];
};

type SVTReportDescriptorOptionsBase = {
  data?: { [key: string]: string };
  fix?: ((fixer: SVTRuleFixer) => IterableIterator<Rule.Fix> | null | Rule.Fix | Rule.Fix[]) | null;
};
type SVTSuggestionDescriptorMessage = { desc: string } | { messageId: string };
type SVTSuggestionReportDescriptor = SVTReportDescriptorOptionsBase & SVTSuggestionDescriptorMessage;
type SVTReportDescriptorOptions = {
  suggest?: null | SVTSuggestionReportDescriptor[];
} & SVTReportDescriptorOptionsBase;
type SVTReportDescriptorMessage = { message: string } | { messageId: string };
type SVTReportDescriptorLocation =
  | { loc: { column: number; line: number } | AST.SourceLocation }
  | { node: SVTNodeOrToken };
export type SVTReportDescriptor = SVTReportDescriptorLocation &
  SVTReportDescriptorMessage &
  SVTReportDescriptorOptions;

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

export type SVTSourceCode = {
  ast: AST.SvelteProgram;
  hasBOM: boolean;
  lines: string[];
  scopeManager: ScopeManager;
  text: string;
  visitorKeys: ESLintSourceCode.VisitorKeys;
  parserServices: {
    [key: string]: unknown;
    esTreeNodeToTSNodeMap?: ReadonlyMap<unknown, TS.Node>;
    getStyleContext?: () => StyleContext;
    getSvelteHtmlAst?: () => unknown;
    hasFullTypeInformation?: boolean; // Old typescript-eslint
    isSvelte?: boolean;
    isSvelteScript?: boolean;
    program?: TS.Program;
    svelteParseContext?: {
      /** The version of "svelte/compiler". */
      compilerVersion?: string;
      /**
       * Whether to use Runes mode.
       * May be `true` if the user is using Svelte v5.
       * Resolved from `svelte.config.js` or `parserOptions`, but may be overridden by `<svelte:options>`.
       */
      runes?: boolean;
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
  /**
   * Returned from `loadConfig()` utility if not provided
   */
  config?: string;
  cssFiles?: string[];
  cssFilesRefreshRate?: number;
  ignoredKeys?: string[];
  removeDuplicates?: boolean;
  skipClassAttribute?: boolean;
  /**
   * Can be set to e.g. ['tw'] for use in tw`bg-blue`
   */
  tags?: string[];
  whitelist?: string[];
};
export type SVTPluginOptions = Partial<SVTPluginConfiguration>;

export type SVTRuleModule<
  T extends readonly Partial<SVTPluginConfiguration>[]
> = { defaultOptions: T } & Rule.RuleModule;
export type SVTRuleContext<
  TOptions extends readonly unknown[],
  TMessageIds extends string
> = Readonly<
  {
    // Override report to include Svelte parser types
    report: (descriptor: SVTReportDescriptor) => void;
    // Override the custom settings so that they are type safe accross rules
    settings: { taildwindcss?: SVTPluginConfiguration } & SharedConfigurationSettings;
    // Override SourceCode to include Svelte parser types
    sourceCode: Readonly<SVTSourceCode>;
  } &
  Exclude<TSRuleContext<TMessageIds, TOptions>, 'report' | 'settings' | 'sourceCode'>
>;

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

export type LegacyTailwindContext = {
  layerOrder: { components: bigint };
  tailwindConfig: {
    prefix: ((selector: string) => string) | string;
  };
  getClassOrder?: (classList: string[]) => [string, bigint | null][];
};
