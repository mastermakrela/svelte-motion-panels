<script lang="ts">
	import type { Orientation } from '$lib/index.js';
	import { Group, Panel, Separator } from '$lib/index.js';

	let { size = 240, orientation = 'horizontal' }: { size?: number; orientation?: Orientation } =
		$props();
</script>

<div style="width: 800px; height: 400px">
	<Group {orientation}>
		<Panel {size} minSize={100} data-testid="sized">sized</Panel>
		<Separator data-testid="grip" />
		<Panel data-testid="fill">fill</Panel>
	</Group>
</div>
