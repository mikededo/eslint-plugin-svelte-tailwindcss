// Missing dependencies do not need to be installed
import type { IconProps, Icon as LucideIcon } from 'lucide-svelte';
import type { ComponentType } from 'svelte';
import { twMerge } from 'tailwind-merge';

export type BaseProps = {
  Icon: ComponentType<LucideIcon>;
  href?: string;
  size?: IconButtonSizes;
  wrapperClasses?: string;
  color?: IconButtonColor;
  iconClasses?: string;
  strokeWidth?: IconProps['strokeWidth'];
};
export type IconButtonColor = 'destructive' | 'muted' | 'primary' | 'surface';
export type IconButtonSizes = 'default' | 'large' | 'small';

const ICON_SIZES: Record<IconButtonSizes, string> = {
  default: 'ui-size-5',
  large: 'ui-size-6',
  small: 'ui-size-4'
};
const ICON_WRAPPER_SIZES: Record<IconButtonSizes, string> = {
  default: 'ui-size-8',
  large: 'ui-size-10',
  small: 'ui-size-6'
};
const ICON_WRAPPER_CLASSES =
  'ui-flex ui-items-center ui-justify-center ui-rounded-full ui-hover:bg-muted ui-transition-colors ui-cursor-pointer';
const COLORS_CLASSES: Record<IconButtonColor, string> = {
  destructive: 'ui-text-destructive-500 hover:ui-bg-destructive-50 ui-stroke-destructive-500',
  muted:
    'ui-bg-transparent ui-text-foreground hover:ui-bg-surface-50 ui-stroke-foreground dark:ui-text-white dark:ui-stroke-white dark:hover:ui-bg-surface-900 disabled:ui-bg-surface-50 disabled:ui-text-surface-200',
  primary:
    'ui-bg-primary dark:ui-bg-primary-800 ui-text-white hover:ui-bg-primary/90 hover:dark:ui-bg-primary-800/90 ui-stroke-white disabled:ui-bg-primary/75 dark:disabled:ui-bg-primary-800/75',
  surface:
    'dark:ui-bg-surface-900 ui-bg-surface-50 dark:ui-text-white dark:ui-stroke-white hover:ui-bg-surface/80 dark:hover:ui-bg-surface-900/90 ui-border ui-border-transparent hover:ui-border-surface-100 dark:hover:ui-border-surface-700'
};

export const getWrapperClasses = ({
  classes,
  color,
  size
}: { classes?: string } & Required<Pick<BaseProps, 'color' | 'size'>>) =>
  twMerge(ICON_WRAPPER_CLASSES, ICON_WRAPPER_SIZES[size], COLORS_CLASSES[color ?? 'primary'], classes);

export const getIconClasses = ({
  classes,
  size
}: { classes?: string } & Required<Pick<BaseProps, 'size'>>) =>
  twMerge(ICON_SIZES[size], 'stroke-inherit', classes);
