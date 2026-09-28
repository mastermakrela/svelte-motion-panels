<!--
@component
A bordered card with a mono header: a label, an optional size badge, and an
optional `head` snippet on the right (the reorder demo puts its Handle there).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import { CARD, CARD_HEAD, SIZE_BADGE } from './styles.js';

	let {
		children,
		head,
		label,
		size
	}: { children?: Snippet; head?: Snippet; label: string; size?: string } = $props();
</script>

<div class={CARD}>
	<div class={CARD_HEAD}>
		<span class="truncate">{label}</span>
		{#if size || head}
			<span class="flex items-center gap-1.5">
				{#if size}<span class={SIZE_BADGE}>{size}</span>{/if}
				{@render head?.()}
			</span>
		{/if}
	</div>
	{@render children?.()}
</div>
