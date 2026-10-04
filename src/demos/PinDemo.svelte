<script lang="ts">
	import { Group, Panel, Separator } from '#lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import { COMPACT, Card, Demo, FILES, PANE, Rows, SEPARATOR, px } from './shared/index.js';
	import Button from './ui/Button.svelte';
	import Toggle from './ui/Toggle.svelte';

	const PIN_TEXT =
		'Pinning holds this text at the width the panel ends the fold with, so the line breaks are measured once instead of on every frame. Turn the pin off and watch the words rewrap the whole way through. Real content pays that cost on every frame too: a code editor relaying out, a virtualised table remeasuring its rows.';

	const compact = new MediaQuery(COMPACT, false);
	let width = $derived(compact.current ? 130 : 240);
	let collapsed = $state(false);
	let pinned = $state(true);
</script>

<Demo>
	{#snippet controls()}
		<Toggle bind:pressed={pinned}>pin {pinned ? 'on' : 'off'}</Toggle>
		<Button size="sm" variant="outline" class="ml-auto" onclick={() => (collapsed = !collapsed)}>
			{collapsed ? 'Expand' : 'Collapse'}
		</Button>
	{/snippet}

	<Group orientation="horizontal">
		<Panel bind:size={width} bind:collapsed minSize="20%" maxSize="55%" class={PANE}>
			<Card label="Sidebar" size={px(width, collapsed)}>
				<Rows items={FILES} active="Group.svelte" />
			</Card>
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize sidebar" />
		<Panel pin={pinned}>
			<p class="overflow-hidden px-4 py-3 text-[13px] leading-[1.7] text-muted-foreground">
				{PIN_TEXT}
			</p>
		</Panel>
	</Group>
</Demo>
