<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';

	let { separated = true }: { separated?: boolean } = $props();
</script>

<div style="width: 800px; height: 400px">
	<Group>
		<Panel size={240}>sized</Panel>
		{#if separated}
			<Separator />
		{/if}
		<Panel>fill</Panel>
	</Group>
</div>
