<script lang="ts">
    import twMerge from 'tw-merge';

    const merged = twMerge('md:bg-blue-500 w-full h-screen bg-blue-200 bg-blue-200 px-2 py-4');
    const merged2 = twMerge(
        'md:bg-blue-500 w-full h-screen bg-blue-200 bg-blue-200 px-2 py-4',
        'md:bg-blue-500 w-full h-screen bg-blue-200 bg-blue-200 px-2 py-4',
        'md:bg-blue-500 w-full h-screen bg-blue-200 bg-blue-200 px-2 py-4',
    );
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="md:bg-blue-500 w-full h-screen bg-blue-200 bg-blue-200 px-2 py-4"></div>
<div class="md:bg-blue-200 {merged} md:p-8"></div>

<style>
:root {
    @apply bg-blue-200;
}
</style>
