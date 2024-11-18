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
  fix?: null | ((fixer: SVTRuleFixer) => null | Rule.Fix | IterableIterator<Rule.Fix> | Rule.Fix[]);
};
type SVTSuggestionDescriptorMessage = { desc: string } | { messageId: string };
type SVTSuggestionReportDescriptor = SVTSuggestionDescriptorMessage & SVTReportDescriptorOptionsBase;
type SVTReportDescriptorOptions = {
  suggest?: SVTSuggestionReportDescriptor[] | null;
} & SVTReportDescriptorOptionsBase;
type SVTReportDescriptorMessage = { message: string } | { messageId: string };
type SVTReportDescriptorLocation =
  | { node: SVTNodeOrToken }
  | { loc: AST.SourceLocation | { line: number; column: number } };
export type SVTReportDescriptor = SVTReportDescriptorMessage &
  SVTReportDescriptorLocation &
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
  text: string;
  ast: AST.SvelteProgram;
  lines: string[];
  hasBOM: boolean;
  parserServices: {
    isSvelte?: boolean;
    isSvelteScript?: boolean;
    getSvelteHtmlAst?: () => unknown;
    getStyleContext?: () => StyleContext;
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
      svelteConfig?: SvelteConfig | null;
    };
    program?: TS.Program;
    esTreeNodeToTSNodeMap?: ReadonlyMap<unknown, TS.Node>;
    hasFullTypeInformation?: boolean; // Old typescript-eslint
    [key: string]: unknown;
  };
  scopeManager: ScopeManager;
  visitorKeys: ESLintSourceCode.VisitorKeys;

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
  ) => AST.Token | AST.Comment | null;

  getFirstToken: ((node: SVTNodeOrToken) => AST.Token) & ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstToken']>[1]
  ) => AST.Token | AST.Comment | null);

  getFirstTokens: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokens']>[1]
  ) => (AST.Token | AST.Comment)[];

  getLastToken: ((node: SVTNodeOrToken) => AST.Token) & ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastToken']>[1]
  ) => AST.Token | AST.Comment | null);

  getLastTokens: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokens']>[1]
  ) => (AST.Token | AST.Comment)[];

  getTokenBefore: ((node: SVTNodeOrToken) => AST.Token | null) & ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokenBefore']>[1]
  ) => AST.Token | AST.Comment | null);

  getTokensBefore: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokensBefore']>[1]
  ) => (AST.Token | AST.Comment)[];

  getTokenAfter: ((node: SVTNodeOrToken) => AST.Token | null) & ((
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokenAfter']>[1]
  ) => AST.Token | AST.Comment | null);

  getTokensAfter: (
    node: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getTokensAfter']>[1]
  ) => (AST.Token | AST.Comment)[];

  getFirstTokenBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokenBetween']>[2]
  ) => AST.Token | AST.Comment | null;

  getFirstTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getFirstTokensBetween']>[2]
  ) => (AST.Token | AST.Comment)[];

  getLastTokenBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokenBetween']>[2]
  ) => AST.Token | AST.Comment | null;

  getLastTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    options?: Parameters<ESLintSourceCode['getLastTokensBetween']>[2]
  ) => (AST.Token | AST.Comment)[];

  getTokensBetween: (
    left: SVTNodeOrToken,
    right: SVTNodeOrToken,
    padding?: Parameters<ESLintSourceCode['getTokensBetween']>[2]
  ) => (AST.Token | AST.Comment)[];

  getTokens: ((node: SVTNodeOrToken, beforeCount?: number, afterCount?: number) => AST.Token[]) & ((
    node: SVTNodeOrToken,
    options: Parameters<ESLintSourceCode['getTokens']>[1]
  ) => (AST.Token | AST.Comment)[]);

  commentsExistBetween: (left: SVTNodeOrToken, right: SVTNodeOrToken) => boolean;

  getCommentsBefore: (nodeOrToken: SVTNodeOrToken | AST.Token) => AST.Comment[];

  getCommentsAfter: (nodeOrToken: SVTNodeOrToken | AST.Token) => AST.Comment[];

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
  Exclude<TSRuleContext<TMessageIds, TOptions>, 'settings' | 'sourceCode' | 'report'> &
  {
    // Override SourceCode to include Svelte parser types
    sourceCode: Readonly<SVTSourceCode>;
    // Override the custom settings so that they are type safe accross rules
    settings: { taildwindcss?: SVTPluginConfiguration } & SharedConfigurationSettings;
    // Override report to include Svelte parser types
    report: (descriptor: SVTReportDescriptor) => void;
  }
>;

export type SVTRuleMeta<
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string,
  TDocs = unknown
> = Omit<RuleWithMetaAndName<TOptions, TMessageIds>, 'create'> & {
  meta: NamedCreateRuleMeta<TMessageIds, TDocs> & {
    /**
     * Ensure the schema is type safe with all the available options.
     */
    schema: (Omit<JSONSchema4ObjectSchema, 'properties'> & {
      properties?: Record<keyof TOptions[number], JSONSchema4>;
    })[];
  };
  /**
   * We override the current `create` method to ensure the `SourceCode`
   * includes all Svelte AST nodes and methods work with Svelte's AST.
   */
  create: (context: SVTRuleContext<TOptions, TMessageIds>, optionsWithDefault: Readonly<TOptions>) => RuleListener;
};

export type LegacyTailwindContext = {
  tailwindConfig: {
    prefix: string | ((selector: string) => string);
  };
  getClassOrder?: (classList: string[]) => [string, bigint | null][];
  layerOrder: { components: bigint };
};
