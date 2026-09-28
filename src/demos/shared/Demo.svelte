<!--
@component
The frame every demo sits in: an optional control bar, the stage, an optional footer.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		controls,
		footer,
		tall = false
	}: { children: Snippet; controls?: Snippet; footer?: Snippet; tall?: boolean } = $props();
</script>

<figure class="mt-6 overflow-hidden border">
	{#if controls}
		<div class="flex flex-wrap items-center gap-2 border-b bg-card p-2">
			{@render controls()}
		</div>
	{/if}
	<div class={['bg-well p-2.5', tall ? 'h-[360px]' : 'h-[300px]']}>
		{@render children()}
	</div>
	{#if footer}
		<div class="border-t bg-card">{@render footer()}</div>
	{/if}
</figure>
