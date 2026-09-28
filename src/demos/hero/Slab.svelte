<!--
@component
A hero card: mono header with a badge and a reorder grip, and a body that
fades out at the bottom (and at the right, with `bleed`).
-->
<script lang="ts">
	import { Handle } from '$lib/index.js';
	import type { Snippet } from 'svelte';

	let {
		badge,
		bleed = false,
		children,
		label
	}: { badge?: Snippet; bleed?: boolean; children: Snippet; label: string } = $props();
</script>

<div class="flex h-full w-full flex-col overflow-hidden border bg-card">
	<div
		class="kicker flex h-8 flex-none items-center justify-between gap-2 border-b px-2.5 whitespace-nowrap text-muted-foreground/70"
	>
		<span>{label}</span>
		<span class="flex items-center gap-1.5">
			{@render badge?.()}
			<Handle
				class="flex cursor-grab items-center gap-[3px] rounded-sm px-1 py-1.5 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
			>
				{#each [0, 1, 2] as dot (dot)}
					<span class="size-[3px] rounded-full bg-muted-foreground/60"></span>
				{/each}
			</Handle>
		</span>
	</div>
	<div class="relative min-h-0 flex-1 overflow-hidden">
		{@render children()}
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-card to-transparent"
		></div>
		{#if bleed}
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-card to-transparent"
			></div>
		{/if}
	</div>
</div>
