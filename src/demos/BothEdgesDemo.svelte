<script lang="ts">
	import { Group, Panel } from '#lib/index.js';

	import { Card, Demo, Editor, FILES, PANE, Rows, SYMBOLS } from './shared/index.js';

	// Percentages in, percentages out: a drag reports a percent string back.
	let left = $state<`${number}%`>('25%');
	let right = $state<`${number}%`>('25%');
</script>

<Demo>
	<Group orientation="horizontal">
		<Panel bind:size={left} minSize="14%" maxSize="35%" class={PANE}>
			<Card label="Files" size={left}>
				<Rows items={FILES} active="+page.svelte" />
			</Card>
		</Panel>
		<Panel class={PANE}>
			<Editor />
		</Panel>
		<Panel bind:size={right} minSize="14%" maxSize="35%" class={PANE}>
			<Card label="Outline" size={right}>
				<Rows items={SYMBOLS} />
			</Card>
		</Panel>
	</Group>
</Demo>
