<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';

	import { Card, Demo, Editor, Lines, OUTPUT, PANE, SEPARATOR, px } from './shared/index.js';

	let height = $state(120);
</script>

<Demo>
	<Group orientation="vertical">
		<Panel class={PANE}>
			<Editor />
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize output" />
		<Panel bind:size={height} minSize={80} maxSize={220} class={PANE}>
			<Card label="Output" size={px(height)}>
				<Lines lines={OUTPUT} terminal />
			</Card>
		</Panel>
	</Group>
</Demo>
