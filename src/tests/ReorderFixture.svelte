<script lang="ts">
	import { Group, Handle, Panel, Separator } from '#lib/index.js';

	let { order = $bindable(['files', 'outline']) }: { order?: string[] } = $props();

	const sizes: Record<string, number> = { files: 180, outline: 130 };
	const row = $derived([order[0], 'seam-a', 'fill', 'seam-b', order[1]]);
</script>

<Group {order} onOrderChange={(next) => (order = next)}>
	{#each row as item (item)}
		{#if item === 'fill'}
			<Panel />
		{:else if item.startsWith('seam')}
			<Separator aria-label={item} />
		{:else}
			<Panel size={sizes[item]} value={item}>
				<Handle />
			</Panel>
		{/if}
	{/each}
</Group>
