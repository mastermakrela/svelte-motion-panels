<script lang="ts">
	import { onMount } from 'svelte';

	let { log }: { log: string[] } = $props();

	onMount(() => {
		log.push('mount');

		return () => log.push('unmount');
	});
</script>

probe
