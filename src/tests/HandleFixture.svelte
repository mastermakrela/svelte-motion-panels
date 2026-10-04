<script lang="ts">
	import { Group, Handle, Panel } from '#lib/index.js';

	let {
		onOrderChange,
		order,
		rtl = false
	}: { onOrderChange?: (order: string[]) => void; order?: string[]; rtl?: boolean } = $props();
</script>

{#snippet side(value: string)}
	<Panel size={100} {value}>
		<Handle style={rtl ? 'direction: rtl' : undefined}>{value}</Handle>
	</Panel>
{/snippet}

<Group {onOrderChange} {order}>
	{@render side(order?.[0] ?? 'files')}
	<Panel />
	{@render side(order?.[1] ?? 'outline')}
</Group>
