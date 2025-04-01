<script lang="ts">
    import type { Snippet } from 'svelte';

    import '../global.css';

    import type { LayoutData } from './$types';

    import { fade } from 'svelte/transition';

    type Props = { children: Snippet; data: LayoutData };
    const { children, data }: Props = $props();
</script>

{#key data.pathname}
    <main
        class="container relative flex min-h-[calc(100vh-48px)] flex-col bg-white px-6 py-8 lg:py-12 lg:pb-28 lg:pt-16"
        in:fade={{ delay: 100, duration: 100 }}
        out:fade={{ duration: 100 }}
    >
        {@render children()}
    </main>
{/key}

<footer class="mt-auto flex h-12 w-full items-center justify-center bg-gray-50 text-sm">
    <p>Footer</p>
</footer>
