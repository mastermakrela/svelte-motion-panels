<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<h3 class="mt-12 text-[19px] font-medium tracking-[-0.02em]">{@render children()}</h3>
