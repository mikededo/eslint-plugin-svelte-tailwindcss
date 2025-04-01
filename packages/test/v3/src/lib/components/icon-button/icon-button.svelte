<script lang='ts'>
  import type { BaseProps } from './styles.js';

  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  import { getIconClasses, getWrapperClasses } from './styles.js';

  type Props = (
    | ({ href: string } & HTMLAnchorAttributes)
    | ({ href?: never } & HTMLButtonAttributes)
  ) & BaseProps;

  const {
    color = 'primary',
    Icon,
    iconClasses,
    size = 'default',
    strokeWidth,
    wrapperClasses,
    ...restProps
  }: Props = $props();

  const iconProps = { strokeWidth };
  const wrapperClass = $derived(getWrapperClasses({ classes: wrapperClasses, color, size }));
  const iconClass = $derived(getIconClasses({ classes: iconClasses, size }));
</script>

{#if 'href' in restProps}
  <a {...restProps as HTMLAnchorAttributes} class={wrapperClass} href={restProps.href}>
    <Icon class={iconClass} {...iconProps} />
  </a>
{:else}
  <button {...restProps as HTMLButtonAttributes} class={wrapperClass}>
    <Icon class={iconClass} {...iconProps} />
  </button>
{/if}
