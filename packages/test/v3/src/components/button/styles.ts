import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'condensed' | 'default' | 'expanded';
export type ButtonColor = 'destructive' | 'muted' | 'primary' | 'surface';
type BaseProps = {
  class?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
};
export type Props = (
  | ({ href: string } & HTMLAnchorAttributes)
  | ({ href?: never } & HTMLButtonAttributes)
) & BaseProps;

const VARIANTS: Record<ButtonVariant, string> = {
  condensed: 'py-1 px-2.5 h-unset text-xs font-normal',
  default: 'px-4 py-2 text-sm',
  expanded: 'px-6 py-3 text-md'
};
const COLORS: Record<ButtonColor, string> = {
  destructive:
    'bg-destructive-500 text-white hover:bg-destructive-500/90 stroke-destructive',
  muted:
    'bg-transparent text-foreground hover:bg-surface-50 stroke-foreground dark:text-white dark:stroke-white dark:hover:bg-surface-900 disabled:bg-surface-50 disabled:text-surface-200',
  primary:
    'bg-primary dark:bg-primary-800 text-white hover:bg-primary/90 dark:hover:bg-primary-800/90 stroke-white disabled:bg-primary/75 dark:disabled:bg-primary-800/75',
  surface:
    'bg-surface-50 dark:bg-surface-900 dark:text-white dark:stroke-white dark:hover:bg-surface-900/90 border border-transparent hover:border-surface-100 dark:hover:border-surface-700 disabled:bg-surface-50 disabled:text-surface-400 disabled:hover:border-surface-50'
};

export const sharedClasses = ({
  className,
  color,
  variant
}: { className?: null | string } & Required<Pick<BaseProps, 'color' | 'variant'>>) =>
  twMerge(
    'whitespace-nowrap rounded-full font-medium transition-all focus-visible:scale-[0.975] focus-visible:outline-hidden active:scale-[0.975] disabled:cursor-not-allowed disabled:active:scale-100',
    VARIANTS[variant],
    COLORS[color],
    className
  );
