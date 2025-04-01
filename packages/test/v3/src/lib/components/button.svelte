<script lang='ts'>
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  type Props = HTMLButtonAttributes;

  const { ...rest }: Props = $props();

  const mergedClasses = $derived(
    twMerge(
      'ui-transition-all ui-px-4 ui-py-2 ui-font-semibold ui-rounded ui-shadow-sm ui-transition-all',
      rest.disabled ? 'ui-cursor-not-allowed ui-text-gray-500 ui-cursor-not-allowed ui-bg-gray-300' : 'ui-text-white ui-hover:bg-blue-600 ui-bg-blue-500',
      rest.class
    )
  );
</script>

<!-- Keep a duplicated class -->
<p class='ui-cursor-not-allowed ui-bg-gray-300 ui-text-gray-500 ui-cursor-not-allowed'>
  Classes with the class attribute
</p>
<button {...rest} class={mergedClasses}>
  {@render rest.children?.()}
</button>
