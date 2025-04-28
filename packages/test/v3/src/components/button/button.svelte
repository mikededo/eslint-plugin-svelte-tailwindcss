<script lang="ts">
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    import type { Props } from './styles.js';

    import { sharedClasses } from './styles.js';

    const { children, color = 'primary', variant = 'default', ...restProps }: Props = $props();

    const elementProps = $derived({
        ...restProps,
        'aria-disabled': restProps.disabled ? 'true' : restProps['aria-disabled']
    });
    const classes = $derived(sharedClasses({ className: restProps.class, color, variant }));
</script>

{#if 'href' in elementProps}
    <a {...elementProps as HTMLAnchorAttributes} class={classes} href={elementProps.href}>
        {#if children}
            {@render children()}
        {/if}
    </a>
{:else}
    <button {...elementProps} class={classes}>
        {#if children}
            {@render children()}
        {/if}
    </button>
{/if}
