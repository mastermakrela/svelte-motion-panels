<script lang="ts">
	import { Group, Handle, Panel, Separator } from '$lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import {
		COMPACT,
		Card,
		Demo,
		FILES,
		Lines,
		PANE,
		Rows,
		SEPARATOR,
		SOURCE,
		SYMBOLS
	} from './shared/index.js';

	const compact = new MediaQuery(COMPACT, false);
	let order = $state(['files', 'outline']);
	let files = $derived(compact.current ? 120 : 180);
	let outline = $derived(compact.current ? 96 : 130);

	// One keyed each over the whole row: a reorder swaps two keys, so Svelte
	// moves the two panel elements instead of remounting them.
	const row = $derived([order[0], 'seam-a', 'workspace', 'seam-b', order[1]]);
</script>

{#snippet grip()}
	<Handle
		class="flex flex-none cursor-grab items-center gap-[3px] rounded-sm px-1 py-1.5 outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
	>
		{#each [0, 1, 2] as dot (dot)}
			<span class="size-[3px] rounded-full bg-muted-foreground/60"></span>
		{/each}
	</Handle>
{/snippet}

<Demo>
	<Group {order} onOrderChange={(next) => (order = next)}>
		{#each row as item (item)}
			{#if item === 'workspace'}
				<Panel class={PANE}>
					<Card label="Workspace.svelte" head={grip}>
						<Lines lines={SOURCE} />
					</Card>
				</Panel>
			{:else if item.startsWith('seam')}
				<Separator class={SEPARATOR} />
			{:else if item === 'files'}
				<Panel value="files" bind:size={files} minSize={96} maxSize="40%" class={PANE}>
					<Card label="Files" head={grip}>
						<Rows items={FILES} active="Panel.svelte" />
					</Card>
				</Panel>
			{:else}
				<Panel value="outline" bind:size={outline} minSize={96} maxSize="40%" class={PANE}>
					<Card label="Outline" head={grip}>
						<Rows items={SYMBOLS} active="Separator" />
					</Card>
				</Panel>
			{/if}
		{/each}
	</Group>

	{#snippet footer()}
		<p class="px-3 py-2 font-mono text-[11px] text-muted-foreground">order: [{order.join(', ')}]</p>
	{/snippet}
</Demo>
