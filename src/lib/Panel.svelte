<!--
@component
A panel in a Group. With a `size` it is a sized panel the neighbouring
Separator resizes; without one it is the filling panel that takes the rest of
the room (a group needs exactly one).

`size` and `collapsed` are bindable. Content can carry its own Svelte `in:` /
`out:` transitions: with `keepMounted={false}` it unmounts once folded shut.
-->
<script lang="ts" module>
	import type { Transition } from 'motion';
	import type { Size } from 'motion-panels';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	/**
	 * `S` follows the size given: a number reports numbers, a percent string
	 * reports percent strings.
	 */
	export type SizedPanelProps<S extends Size = number> = DivProps & {
		children?: Snippet;
		collapsed?: boolean;
		defaultSize?: S;
		/** Keep the content mounted once it has been shown. Default `true`. */
		keepMounted?: boolean;
		maxSize?: Size;
		minSize?: Size;
		/**
		 * With this or `collapsed` given, a drag past half the min size collapses
		 * the panel and Enter toggles it.
		 */
		onCollapsedChange?: (collapsed: boolean) => void;
		onFoldEnd?: () => void;
		onSizeChange?: (size: S) => void;
		overshoot?: boolean | number;
		pin?: undefined;
		size: S;
		transition?: Transition;
		value?: unknown;
	};

	export type FillPanelProps = DivProps & {
		children?: Snippet;
		/** Hold the content at its size while a neighbour folds, instead of reflowing it. */
		pin?: boolean;
		size?: undefined;
		value?: unknown;
	} & { [K in Exclude<keyof SizedOnly, 'size'>]?: undefined };

	type SizedOnly = Omit<SizedPanelProps, keyof DivProps | 'children' | 'pin' | 'value'>;

	export type PanelProps<S extends Size = number> = FillPanelProps | SizedPanelProps<S>;

	const px = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
</script>

<script lang="ts" generics="S extends Size = number">
	import type { PanelOptions } from 'motion-panels';
	import { coarsePointer, createPanel, edgeSize } from 'motion-panels';
	import { onDestroy, untrack } from 'svelte';

	import { bindStyle, getGroup, getReorder, liveStyle, store } from './internal.js';
	import Separator from './Separator.svelte';
	import Slot from './Slot.svelte';

	let {
		children,
		collapsed = $bindable(),
		defaultSize,
		keepMounted = true,
		maxSize,
		minSize,
		onCollapsedChange,
		onFoldEnd,
		onSizeChange,
		overshoot,
		pin,
		size = $bindable(),
		style,
		transition,
		value,
		...rest
	}: PanelProps<S> = $props();

	const group = getGroup();
	const { axes, fill } = group;
	const reordering = getReorder();

	// Reads every prop, so an effect calling this re-runs whenever one changes.
	const options = (): PanelOptions<S> => ({
		collapsed,
		defaultSize,
		maxSize,
		minSize,
		// The core makes a panel collapsible by drag and Enter only when this is
		// given; a bound (or passed) `collapsed` counts, as well as the callback.
		onCollapsedChange:
			onCollapsedChange || collapsed !== undefined
				? (next) => {
						collapsed = next;
						onCollapsedChange?.(next);
					}
				: undefined,
		onFoldEnd,
		onSizeChange: (next) => {
			size = next;
			onSizeChange?.(next);
		},
		overshoot,
		size: size as S,
		transition
	});

	// Sized or filling is decided once, at mount: React remounts on the switch,
	// here wrap the Panel in {#key} if it has to flip.
	const panel = untrack(() => (size === undefined ? null : createPanel(group, options())));
	onDestroy(() => panel?.destroy());

	const status = panel && store(panel.subscribe, () => panel.state);
	const edge = store(coarsePointer.subscribe, edgeSize);

	const dragging = $derived(!!status?.current.dragging);
	const folding = $derived(!!status?.current.folding);
	// Whether the content was present as of the last sync. The controller only
	// reports `folding` once sync has run, so going by a fresh `collapsed`
	// alone would unmount the content for one step before the fold holds it
	// (React's sync runs in a layout effect, before that step is ever seen).
	let held = $state(untrack(() => !collapsed));
	const present = $derived(!collapsed || held);
	// Once shown, content stays mounted unless keepMounted is off (React's `shown`).
	let shown = false;
	const mounted = $derived.by(() => {
		shown ||= present;

		return keepMounted ? shown : present;
	});
	const clipping = $derived(!!collapsed || dragging || folding);

	// Notifies on every change to the group's layout, e.g. a Separator mounted or removed.
	const layout = store(group.subscribe, () => group.panels);

	let wasMounted = false;
	$effect(() => {
		if (!panel || !status) {
			return;
		}
		// The DOM around this element can change without touching a prop.
		// React's sync runs on every render; here the signals are the order,
		// read item by item as Group does, and the group's notifications, so
		// the core re-places the panel on its side once the DOM has changed and
		// the separators re-bind to it. Its own state re-runs this as well.
		void (reordering.current && [...reordering.current.order]);
		void layout.current;
		void status.current;
		const next = options();
		const now = mounted;
		const mounting = now && !wasMounted;
		untrack(() => {
			panel.sync(next, mounting);
			const { dragging, folding } = status.current;
			held = !next.collapsed || dragging || folding;
		});
		wasMounted = now;
	});

	// Server-rendered first frame; the attachments take over in the browser.
	const initial = panel ? Math.abs(panel.motion.size.get()) : 0;
	const initialContent = panel ? panel.motion.content.get() : 0;
	const initialOverflow = untrack(() => (collapsed ? 'clip' : 'visible'));
</script>

{#if panel && status}
	<Slot
		{value}
		style="display: flex; flex-direction: {axes.direction}; flex-shrink: 0; position: relative; {axes.extent}: {initial}px; justify-content: flex-end; overflow: {initialOverflow};"
		{@attach (element) => panel.attach(element)}
		{@attach bindStyle(panel.motion.size, axes.extent, (extent: number) => `${Math.abs(extent)}px`)}
		{@attach liveStyle(() => ({
			'justify-content': status.current.end ? 'flex-start' : 'flex-end',
			overflow: clipping ? 'clip' : 'visible'
		}))}
	>
		{#if mounted}
			<div
				{...rest}
				style="{style ??
					''}; flex-shrink: 0; {axes.cross}: 100%; {axes.extent}: {initialContent}px;"
				{@attach bindStyle(panel.motion.content, axes.extent, px, () => style)}
			>
				{@render children?.()}
			</div>
		{/if}
		{#if status.current.bare}
			<Separator
				data-motion-panels-edge
				end={status.current.end}
				own={panel}
				style="{axes.extent}: {edge.current}px"
			/>
		{/if}
	</Slot>
{:else if pin}
	<Slot
		data-motion-panels-fill
		{value}
		style="flex: 1; min-height: 0; min-width: 0; display: flex; flex-direction: {axes.direction}; justify-content: flex-start; overflow: visible;"
		{@attach bindStyle(fill.anchor, 'justify-content', String)}
		{@attach bindStyle(fill.size, 'overflow', (room: number | string) =>
			room === '100%' ? 'visible' : 'clip'
		)}
	>
		<div
			{...rest}
			style="{style ?? ''}; flex-shrink: 0; {axes.cross}: 100%; {axes.extent}: 100%;"
			{@attach bindStyle(fill.size, axes.extent, px, () => style)}
		>
			{@render children?.()}
		</div>
	</Slot>
{:else}
	<Slot
		data-motion-panels-fill
		{value}
		{...rest}
		style="flex: 1; min-height: 0; min-width: 0; {style ?? ''}"
	>
		{@render children?.()}
	</Slot>
{/if}
