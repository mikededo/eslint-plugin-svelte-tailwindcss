<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = { children: Snippet; class?: string; }
    const { children, ...rest }: Props = $props();
</script>

<div class="container custom-container mx-auto {rest.class} max-w-screen-lg">
    {@render children()}
</div>

<style>
.custom-container {
    @apply px-4 py-8 md:px-8;
}
</style>
