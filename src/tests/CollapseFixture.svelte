<script lang="ts">
	import { Group, Panel, Separator } from '#lib/index.js';

	import Probe from './Probe.svelte';

	let { collapsed = false, log }: { collapsed?: boolean; log: string[] } = $props();
</script>

<div style="width: 800px; height: 400px">
	<Group>
		<Panel size={240} {collapsed} keepMounted={false} transition={{ duration: 0 }}>
			<Probe {log} />
		</Panel>
		<Separator />
		<Panel>fill</Panel>
	</Group>
</div>
