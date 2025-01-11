<script lang='ts'>
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  type Props = HTMLButtonAttributes;

  const { ...rest }: Props = $props();

  const mergedClasses = $derived(
    twMerge(
      'transition-all px-4 py-2 font-semibold rounded shadow-sm transition-all',
      rest.disabled ? 'cursor-not-allowed text-gray-500 cursor-not-allowed bg-gray-300' : 'text-white hover:bg-blue-600 bg-blue-500',
      rest.class
    )
  );
</script>

<p class='cursor-not-allowed bg-gray-300 text-gray-500 cursor-not-allowed'>
  Classes with the class attribute
</p>
<button {...rest} class={mergedClasses}>
  {@render rest.children?.()}
</button>

