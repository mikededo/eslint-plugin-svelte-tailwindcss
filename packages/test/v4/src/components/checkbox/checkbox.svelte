<script lang="ts">
    import { Check } from 'lucide-svelte';
    import { twMerge } from 'tailwind-merge';

    type Props = {
        label: string;
        name: string;
        checked?: boolean;
        class?: string;
        labelPosition?: 'left' | 'right';
    };
    let { checked = $bindable(false), label, labelPosition, name, ...restProps }: Props = $props();

    const classes = $derived(
        twMerge(
            'size-4 rounded-sm border border-surface-200 text-primary transition-all focus:border-primary aria-checked:bg-primary aria-checked:border-primary checkbox',
            restProps.class
        )
    );
    const flexDirection = $derived(labelPosition === 'left' ? 'flex-row' : 'flex-row-reverse');

    const onClick = () => {
        checked = !checked;
    };
</script>

<div class="flex items-center gap-2 {flexDirection}">
    <button
        class={classes}
        aria-checked={checked}
        aria-label={label}
        data-state={checked ? 'checked' : 'unchecked'}
        id={name}
        role="checkbox"
        type="button"
        value="on"
        onclick={onClick}
    >
        <Check class="size-3.5 stroke-white" strokeWidth={2.5} />
    </button>
    <label class="text-sm" for={name}>{label}</label>
</div>

<style lang="postcss">
    .checkbox:focus {
        box-shadow: 0 0 0 4px var(--color-primary-100);
    }
</style>
