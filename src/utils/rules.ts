import type { RuleListener } from '@typescript-eslint/utils/eslint-utils';

import type { SVTPluginConfiguration, SVTRuleContext, SVTRuleMeta, SVTRuleModule } from './types';

const createRule = <
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string
>({
  create,
  defaultOptions,
  meta
}: Readonly<SVTRuleMeta<TOptions, TMessageIds>>): SVTRuleModule<TOptions> => ({
  create: ((
    context: SVTRuleContext<TOptions, TMessageIds>
  ): RuleListener => {
    const optionsWithDefault = context.options.map((options, index) => ({
      ...defaultOptions[index] || {},
      ...options || {}
    })) as unknown as TOptions;

    return create(context, optionsWithDefault);
  }) as any,
  defaultOptions,
  meta: meta as any
});

export const createNamedRule = <
  TOptions extends readonly Partial<SVTPluginConfiguration>[],
  TMessageIds extends string
>({
  meta,
  ...rule
}: Readonly<SVTRuleMeta<TOptions, TMessageIds>>) =>
  createRule<TOptions, TMessageIds>({
    meta: { ...meta, docs: { ...meta.docs } },
    ...rule
  });
