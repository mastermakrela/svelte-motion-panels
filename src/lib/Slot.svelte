<!--
@component
The element a panel occupies in its group: the outer box of a sized panel, or
the filling panel itself. It owns the panel's `value`, which is what a reorder
handle inside it carries.

In a group with `order` and `onOrderChange`, a slot with a `value` is a
reorder item (React's `Reorder.Item`): a Handle's pointerdown starts carrying
it, it follows the pointer along the group axis, and it trades places with a
movable neighbour once its leading edge crosses that neighbour's middle.
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type SlotProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		children?: Snippet;
		value?: unknown;
	};

	/** Movement before a press on a handle turns into a carry (the core's PAN_THRESHOLD). */
	const THRESHOLD = 3;

	/** Every mounted slot element and its value: how a carried slot finds its movable siblings. */
	const values = new WeakMap<Element, unknown>();
</script>

<script lang="ts">
	import type { AnimationPlaybackControls } from 'motion';
	import { animate } from 'motion';
	import { reorder, timing } from 'motion-panels';
	import { untrack } from 'svelte';

	import type { Reordering } from './internal.js';
	import { getGroup, getReorder, setGrip } from './internal.js';

	let { children, value, ...rest }: SlotProps = $props();

	const { axes } = getGroup();
	const reordering = getReorder();

	let element = $state<HTMLDivElement>();

	$effect(() => {
		if (!element) {
			return;
		}
		const slot = element;
		values.set(slot, value);

		return () => values.delete(slot);
	});

	const vertical = axes.point === 'y';
	/** Where an element sits along the axis in layout, ignoring transforms (FLIP trips included). */
	const start = (node: HTMLElement) => (vertical ? node.offsetTop : node.offsetLeft);
	const length = (node: HTMLElement) => (vertical ? node.offsetHeight : node.offsetWidth);
	const point = (event: PointerEvent) => (vertical ? event.clientY : event.clientX);
	const translate = (offset: number) => `translate${axes.point.toUpperCase()}(${offset}px)`;

	/** The carry in progress: plain variables, since the pointer writes the transform directly. */
	let carry: {
		/** Pointer travel since the press, along the axis. */
		delta: number;
		/** The slot's layout start when the carry began. */
		from: number;
		/**
		 * The reordering the lift started, kept so the release still hands the
		 * group its pointer events back if `order` or `onOrderChange` went away.
		 */
		lifted: Reordering | null;
		offset: number;
		origin: number;
		stop: AbortController;
	} | null = null;
	let settling: AnimationPlaybackControls | null = null;
	/** Sibling positions measured right before handing over a swapped order. */
	let before: Map<Element, number> | null = null;

	/** Keeps the carried slot under the pointer wherever its layout box now is. */
	const follow = (slot: HTMLElement) => {
		if (!carry) {
			return;
		}
		let offset = carry.delta - (start(slot) - carry.from);
		const root = slot.parentElement;
		if (root) {
			// Siblings share an offset parent, which is either the root itself or its own.
			const low = (slot.offsetParent === root ? 0 : start(root)) - start(slot);
			const high = low + length(root) - length(slot);
			offset = Math.min(Math.max(offset, low), Math.max(low, high));
		}
		carry.offset = offset;
		slot.style.transform = translate(offset);
	};

	/** Swaps with the movable neighbour whose middle the carried slot's leading edge has crossed. */
	const trade = (slot: HTMLElement) => {
		const live = reordering.current;
		const root = slot.parentElement;
		if (!carry || !live || !root) {
			return;
		}
		const own = start(slot);
		const forward = carry.offset > 0;
		let neighbour: HTMLElement | null = null;
		for (const child of root.children) {
			if (child === slot || !(child instanceof HTMLElement) || !values.has(child)) {
				continue;
			}
			if (!live.order.includes(values.get(child))) {
				continue;
			}
			const at = start(child);
			const ahead = forward ? at > own : at < own;
			const nearer =
				neighbour === null || (forward ? at < start(neighbour) : at > start(neighbour));
			if (ahead && nearer) {
				neighbour = child;
			}
		}
		if (!neighbour) {
			return;
		}
		// Motion's Reorder rule: the carried slot's leading edge crossing the
		// neighbour's middle, so a wide slot can pass a narrow one at a clamped end.
		const middle = start(neighbour) + length(neighbour) / 2;
		const lead = own + carry.offset + (forward ? length(slot) : 0);
		if (forward ? lead < middle : lead > middle) {
			return;
		}
		// A swap of two entries reads the same in either direction, so an RTL
		// row (`reversed`) needs no turning round here.
		const next = [...live.order];
		const from = next.indexOf(value);
		const to = next.indexOf(values.get(neighbour));
		if (from === -1 || to === -1) {
			return;
		}
		[next[from], next[to]] = [next[to], next[from]];
		before = live.travel ? reorder.measure(root, axes) : null;
		before?.delete(slot);
		live.onOrderChange(next);
	};

	/** Lets go: the slot glides from wherever the pointer left it back into its box. */
	const release = (slot: HTMLElement) => {
		if (!carry) {
			return;
		}
		const { lifted, offset, stop } = carry;
		carry = null;
		stop.abort();
		if (!lifted) {
			return;
		}
		lifted.carry(false);
		settling = animate(
			slot,
			{ [axes.point]: [offset, 0] },
			{
				...timing(lifted.transition),
				onComplete: () => {
					slot.style.zIndex = '';
					settling = null;
				}
			}
		);
	};

	const begin = (event: PointerEvent) => {
		const slot = element;
		if (!slot || event.button !== 0 || carry || value === undefined || !reordering.current) {
			return;
		}
		const stop = new AbortController();
		carry = { delta: 0, from: 0, lifted: null, offset: 0, origin: point(event), stop };
		const { pointerId } = event;
		const listen = { signal: stop.signal };

		window.addEventListener(
			'pointermove',
			(move) => {
				if (!carry || move.pointerId !== pointerId) {
					return;
				}
				carry.delta = point(move) - carry.origin;
				if (!carry.lifted) {
					const live = reordering.current;
					if (!live || Math.abs(carry.delta) < THRESHOLD) {
						return;
					}
					settling?.stop();
					settling = null;
					carry.lifted = live;
					carry.from = start(slot);
					slot.style.zIndex = '2';
					live.carry(true);
				}
				move.preventDefault();
				follow(slot);
				trade(slot);
			},
			listen
		);
		const end = (up: PointerEvent) => {
			if (up.pointerId === pointerId) {
				release(slot);
			}
		};
		window.addEventListener('pointerup', end, listen);
		window.addEventListener('pointercancel', end, listen);
		window.addEventListener(
			'keydown',
			(key) => {
				if (key.key === 'Escape') {
					release(slot);
				}
			},
			listen
		);
	};

	// After a swap the consumer re-renders in the new order and the DOM moves;
	// effects run after that, so this re-bases the carried slot's offset to its
	// new box (it stays under the pointer instead of travelling) and sends the
	// siblings from their old places to their new ones.
	$effect(() => {
		void (reordering.current && [...reordering.current.order]);
		untrack(() => {
			const boxes = before;
			before = null;
			if (!element || !carry?.lifted) {
				return;
			}
			follow(element);
			if (boxes) {
				reorder.play(boxes, axes, reordering.current?.transition);
			}
		});
	});

	// A slot unmounted mid-carry must not leave the group without pointer events.
	$effect(() => () => {
		if (carry) {
			const { lifted, stop } = carry;
			carry = null;
			stop.abort();
			lifted?.carry(false);
		}
	});

	setGrip({
		start: begin,
		get value() {
			return value;
		}
	});
</script>

<div bind:this={element} {...rest}>
	{@render children?.()}
</div>
