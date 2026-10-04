<!--
@component
EXPERIMENTAL, BENCHMARK-ONLY — not exported from `#lib/index.ts`.
With a `size`, a sized panel (size and collapsed bindable); without, the fill.
Sizes reach the DOM through `style:` from Tween state; see engine.svelte.ts.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';

	import type { Size } from './engine.svelte.js';
	import { getNativeGroup, NativePanelState } from './engine.svelte.js';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		children?: Snippet;
		collapsed?: boolean;
		maxSize?: Size;
		minSize?: Size;
		onCollapsedChange?: (collapsed: boolean) => void;
		onFoldEnd?: () => void;
		size?: Size;
	};

	let {
		children,
		collapsed = $bindable(),
		maxSize,
		minSize,
		onCollapsedChange,
		onFoldEnd,
		size = $bindable(),
		...rest
	}: Props = $props();

	const group = getNativeGroup();
	const { horizontal } = group;

	// Sized or filling is decided once, at mount.
	const panel = untrack(() => size !== undefined)
		? new NativePanelState(group, {
				get collapsed() {
					return collapsed;
				},
				get collapsible() {
					return collapsed !== undefined || !!onCollapsedChange;
				},
				get maxSize() {
					return maxSize;
				},
				get minSize() {
					return minSize;
				},
				get size() {
					return size ?? 0;
				},
				onFoldEnd: () => onFoldEnd?.(),
				setCollapsed: (next) => {
					collapsed = next;
					onCollapsedChange?.(next);
				},
				setSize: (next) => {
					size = next;
				}
			})
		: null;

	$effect.pre(() => {
		if (!panel) return;
		const target = panel.target;
		untrack(() => panel.sync(target));
	});

	const extent = $derived(panel ? `${panel.width.current}px` : undefined);
	const content = $derived(panel ? `${panel.open}px` : undefined);
</script>

{#if panel}
	<div
		data-native-panel
		{@attach panel.attach}
		style:display="flex"
		style:flex-direction={horizontal ? 'row' : 'column'}
		style:flex-shrink="0"
		style:overflow="clip"
		style:justify-content={panel.end ? 'flex-start' : 'flex-end'}
		style:width={horizontal ? extent : undefined}
		style:height={horizontal ? undefined : extent}
	>
		<div
			{...rest}
			style:flex-shrink="0"
			style:width={horizontal ? content : '100%'}
			style:height={horizontal ? '100%' : content}
		>
			{@render children?.()}
		</div>
	</div>
{:else}
	<div
		data-native-fill
		{...rest}
		style:flex="1"
		style:min-width="0"
		style:min-height="0"
		style:overflow="clip"
	>
		{@render children?.()}
	</div>
{/if}
