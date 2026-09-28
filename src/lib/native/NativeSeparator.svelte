<!--
@component
EXPERIMENTAL, BENCHMARK-ONLY — not exported from `$lib/index.ts`.
The grip between a NativePanel and the fill: drag it, or focus it and use the
arrow keys, Home / End, and Enter to toggle collapse.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { getNativeGroup } from './engine.svelte.js';

	let {
		'aria-label': ariaLabel = 'Resize panel',
		tabindex = 0,
		...rest
	}: HTMLAttributes<HTMLDivElement> = $props();

	const group = getNativeGroup();
	const { horizontal } = group;

	let element = $state<HTMLDivElement>();
	// Reactive through the group's SvelteMap: resolves once the panel registers.
	const panel = $derived(element ? group.panelFor(element) : undefined);

	const point = (event: PointerEvent) => (horizontal ? event.clientX : event.clientY);

	const onpointerdown = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!panel || event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		panel.press(point(event));
	};
</script>

<!-- A focusable separator is a widget (it carries aria-valuenow), so the tabindex is meant. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...rest}
	bind:this={element}
	role="separator"
	{tabindex}
	aria-label={ariaLabel}
	aria-orientation={horizontal ? 'vertical' : 'horizontal'}
	aria-valuenow={panel?.target}
	aria-valuemin={panel ? Math.round(panel.min) : undefined}
	aria-valuemax={panel && panel.max !== Infinity ? Math.round(panel.max) : undefined}
	data-resizing={panel?.dragging || undefined}
	style:flex-shrink="0"
	style:touch-action="none"
	style:cursor={horizontal ? 'col-resize' : 'row-resize'}
	{onpointerdown}
	onpointermove={(event) => panel?.move(point(event))}
	onpointerup={() => panel?.release()}
	onpointercancel={() => panel?.release()}
	onkeydown={(event) => panel?.key(event)}
></div>
