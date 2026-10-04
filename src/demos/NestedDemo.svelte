<script lang="ts">
	import { Group, Panel, Separator } from '#lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import {
		COMPACT,
		Card,
		Demo,
		Editor,
		FILES,
		Lines,
		OUTPUT,
		PANE,
		Rows,
		SEPARATOR,
		px
	} from './shared/index.js';

	const compact = new MediaQuery(COMPACT, false);
	let sidebar = $derived(compact.current ? 120 : 200);
	let terminal = $state(100);
</script>

<Demo>
	<Group orientation="horizontal">
		<Panel bind:size={sidebar} minSize="18%" maxSize="45%" class={PANE}>
			<Card label="Files" size={px(sidebar)}>
				<Rows items={FILES} active="Panel.svelte" />
			</Card>
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize files" />
		<Panel>
			<Group orientation="vertical">
				<Panel class={PANE}>
					<Editor />
				</Panel>
				<Separator class={SEPARATOR} aria-label="Resize console" />
				<Panel bind:size={terminal} minSize={60} maxSize={180} class={PANE}>
					<Card label="Console" size={px(terminal)}>
						<Lines lines={OUTPUT} terminal />
					</Card>
				</Panel>
			</Group>
		</Panel>
	</Group>
</Demo>
