<!--
@component
A row or column of panels. Holds the core `PanelGroup` every Panel and
Separator inside registers with, and — given `order` and `onOrderChange` —
animates its children to their new places when the order changes.
-->
<script lang="ts" module>
	import type { Transition } from 'motion';
	import type { Orientation } from 'motion-panels';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type GroupProps<V = unknown> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		children?: Snippet;
		onOrderChange?: (order: V[]) => void;
		order?: V[];
		/** Read once, when the group mounts. */
		orientation?: Orientation;
		/** Animate panels to their new places when `order` changes. Default `true`. */
		reorder?: boolean;
		transition?: Transition;
	};
</script>

<script lang="ts" generics="V = unknown">
	import { DEV } from 'esm-env';
	import { createPanelGroup, isRtl, reorder } from 'motion-panels';
	import { untrack } from 'svelte';

	import type { Reordering } from './internal.js';
	import { getParentGroup, setGrip, setGroup, setReorder } from './internal.js';

	let {
		children,
		onOrderChange,
		order,
		orientation = 'horizontal',
		reorder: travel = true,
		style,
		transition,
		...rest
	}: GroupProps<V> = $props();

	const parent = getParentGroup();
	// Created once, like React's useState initialiser: orientation is fixed at mount.
	const group = createPanelGroup(untrack(() => orientation));
	const { axes } = group;

	let root = $state<HTMLDivElement>();
	let carrying = $state(false);
	let rtl = $state(false);

	const sorting = $derived(order !== undefined && onOrderChange !== undefined);

	setGroup(group);
	setGrip(null);
	// One stable object of live getters: a reader may hold on to it and still
	// see every change.
	const reordering: Reordering = {
		carry: (next) => {
			carrying = next;
		},
		get carrying() {
			return carrying;
		},
		get transition() {
			return transition;
		},
		get travel() {
			return travel;
		},
		onOrderChange: (next) => onOrderChange?.(next as V[]),
		get order() {
			return order ?? [];
		},
		get reversed() {
			return rtl;
		}
	};
	setReorder({
		get current() {
			return sorting ? reordering : null;
		}
	});

	$effect(() => {
		if (DEV && (order === undefined) !== (onOrderChange === undefined)) {
			console.warn(
				'Motion Panels: a group reorders only with both order and onOrderChange — one without the other moves nothing.'
			);
		}
	});

	/**
	 * React notices a reorder by its children's keys changing and measures in
	 * render, before the commit. Here the order itself is the signal: read it
	 * element by element (so in-place mutation of a `$state` array counts too),
	 * measure before the DOM moves, and play the trip once it has.
	 */
	let seen = untrack(() => (order ? [...order] : undefined));
	let before: Map<Element, number> | null = null;

	const changed = (next: V[] | undefined) =>
		next === undefined || seen === undefined
			? next !== seen
			: next.length !== seen.length || next.some((item, index) => item !== seen?.[index]);

	$effect.pre(() => {
		const next = order ? [...order] : undefined;
		if (!changed(next)) {
			return;
		}
		seen = next;
		before = root && untrack(() => travel && !carrying) ? reorder.measure(root, axes) : null;
	});

	$effect(() => {
		// Same dependencies as the measure above, so this runs after the DOM moved.
		void (order && [...order]);
		rtl = axes.point === 'x' && isRtl(root ?? null);
		const boxes = before;
		before = null;
		if (boxes) {
			reorder.play(
				boxes,
				axes,
				untrack(() => transition)
			);
		}
	});
</script>

<div
	bind:this={root}
	{...rest}
	style="display: flex; flex-direction: {axes.direction}; width: 100%; height: 100%;{parent
		? ''
		: ' overflow: clip;'} {style ?? ''}"
	style:pointer-events={carrying ? 'none' : undefined}
>
	{@render children?.()}
</div>
