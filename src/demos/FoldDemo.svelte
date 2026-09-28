<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import { FOLDS, FOLD_NAMES, fold, timingOf, type Fold } from './shared/folds.js';
	import {
		COMPACT,
		Card,
		Demo,
		Editor,
		PANE,
		Rows,
		SEPARATOR,
		SYMBOLS,
		px
	} from './shared/index.js';
	import Button from './ui/Button.svelte';
	import Toggle from './ui/Toggle.svelte';
	import ToggleGroup from './ui/ToggleGroup.svelte';

	const compact = new MediaQuery(COMPACT, false);
	let width = $derived(compact.current ? 140 : 260);
	// Bound, so a drag past half of minSize and Enter on the separator fold it too.
	let collapsed = $state(false);
	let preset = $state<Fold>('flip');
	// Off, so the content remounts on every unfold and its in: transition plays.
	let keepMounted = $state(false);

	const code = $derived(
		[
			'<Panel',
			'  bind:size={width}',
			'  bind:collapsed',
			`  keepMounted={${keepMounted}}`,
			...(timingOf(preset) ? [`  transition={${JSON.stringify(timingOf(preset))}}`] : []),
			'>',
			FOLDS[preset].code ? `  <div ${FOLDS[preset].code}>` : '  <div>',
			'</Panel>'
		]
			.join('\n')
			.replaceAll(/"(\w+)":/g, '$1: ')
			.replaceAll('"', "'")
	);
</script>

<Demo>
	{#snippet controls()}
		<ToggleGroup label="Fold preset" items={FOLD_NAMES} bind:value={preset} />
		<div class="ml-auto flex items-center gap-2">
			<Toggle bind:pressed={keepMounted}>keepMounted</Toggle>
			<Button size="sm" variant="outline" onclick={() => (collapsed = !collapsed)}>
				{collapsed ? 'Expand' : 'Collapse'}
			</Button>
		</div>
	{/snippet}

	<Group orientation="horizontal">
		<Panel
			bind:size={width}
			bind:collapsed
			{keepMounted}
			minSize="22%"
			maxSize="52%"
			transition={timingOf(preset)}
			class={PANE}
		>
			<div class="h-full origin-right" in:fold|global={preset}>
				<Card label="Navigator" size={px(width, collapsed)}>
					<Rows items={SYMBOLS} active="Panel" />
				</Card>
			</div>
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize navigator" />
		<Panel class={PANE}>
			<Editor />
		</Panel>
	</Group>

	{#snippet footer()}
		<pre
			class="m-0 overflow-x-auto px-3.5 py-3 font-mono text-[13px] text-muted-foreground">{code}</pre>
	{/snippet}
</Demo>
