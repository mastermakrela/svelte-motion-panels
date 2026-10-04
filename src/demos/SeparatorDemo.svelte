<script lang="ts">
	import { Group, Panel, Separator } from '#lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import { COMPACT, Card, Demo, Editor, FILES, PANE, Rows, SEPARATOR, px } from './shared/index.js';

	const compact = new MediaQuery(COMPACT, false);
	let width = $derived(compact.current ? 130 : 240);
</script>

<Demo>
	<Group orientation="horizontal">
		<Panel bind:size={width} minSize="20%" maxSize="55%" class={PANE}>
			<Card label="Files" size={px(width)}>
				<Rows items={FILES} active="Panel.svelte" />
			</Card>
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize files" />
		<Panel class={PANE}>
			<Editor />
		</Panel>
	</Group>
</Demo>
