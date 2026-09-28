<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import { fold, timingOf } from './shared/folds.js';
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
		SYMBOLS,
		px
	} from './shared/index.js';
	import Toggle from './ui/Toggle.svelte';

	const compact = new MediaQuery(COMPACT, false);
	let files = $derived(compact.current ? 92 : 140);
	let outline = $derived(compact.current ? 84 : 120);
	let terminal = $state(90);
	// Bound both ways: the toggles fold the panels, and so do drags and Enter.
	const hidden = $state({ files: false, outline: false, terminal: false });
</script>

<Demo tall>
	{#snippet controls()}
		<Toggle bind:pressed={hidden.files}>files (flip)</Toggle>
		<Toggle bind:pressed={hidden.outline}>outline (fade)</Toggle>
		<Toggle bind:pressed={hidden.terminal}>terminal (spring)</Toggle>
	{/snippet}

	<Group orientation="horizontal">
		<Panel
			bind:size={files}
			bind:collapsed={hidden.files}
			keepMounted={false}
			minSize="12%"
			maxSize="30%"
			class={PANE}
		>
			<div class="h-full origin-right" in:fold|global={'flip'}>
				<Card label="Files" size={px(files, hidden.files)}>
					<Rows items={FILES} active="Separator.svelte" />
				</Card>
			</div>
		</Panel>
		<Separator class={SEPARATOR} aria-label="Resize files" />
		<Panel>
			<Group orientation="vertical">
				<Panel>
					<Group orientation="horizontal">
						<Panel class={PANE}>
							<Editor />
						</Panel>
						<Separator class={SEPARATOR} aria-label="Resize outline" />
						<Panel
							bind:size={outline}
							bind:collapsed={hidden.outline}
							keepMounted={false}
							minSize="12%"
							maxSize="30%"
							class={PANE}
						>
							<div class="h-full" in:fold|global={'fade'}>
								<Card label="Outline" size={px(outline, hidden.outline)}>
									<Rows items={SYMBOLS} active="Separator" />
								</Card>
							</div>
						</Panel>
					</Group>
				</Panel>
				<Separator class={SEPARATOR} aria-label="Resize terminal" />
				<Panel
					bind:size={terminal}
					bind:collapsed={hidden.terminal}
					keepMounted={false}
					minSize={60}
					maxSize={160}
					transition={timingOf('spring')}
					class={PANE}
				>
					<div class="h-full origin-bottom" in:fold|global={'spring'}>
						<Card label="Terminal" size={px(terminal, hidden.terminal)}>
							<Lines lines={OUTPUT} terminal />
						</Card>
					</div>
				</Panel>
			</Group>
		</Panel>
	</Group>
</Demo>
