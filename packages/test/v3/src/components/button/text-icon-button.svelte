<script lang="ts">
    import type { Icon as LucideIcon } from 'lucide-svelte';
    import type { ComponentType } from 'svelte';

    import type { ButtonProps } from './index.js';

    import { twMerge } from 'tailwind-merge';

    import Button from './button.svelte';

    type Props = {
        label: string;
        Icon: ComponentType<LucideIcon>;
        children?: never;
    } & ButtonProps;
    const { Icon, label, ...restProps }: Props = $props();

    const buttonClasses = $derived(
        twMerge('flex items-center gap-2 h-10 rounded-full text-sm', restProps.class)
    );
</script>

<Button {...restProps} class={buttonClasses}>
    <Icon class="size-4" />
    <span>{label}</span>
</Button>
