<!--
@component
The grip that moves a panel in a reorderable group (one with `order` and
`onOrderChange`). Put it anywhere inside a Panel with a `value`: drag it to
carry the panel along the group axis, or focus it and press the arrow keys to
swap the panel with its neighbour. Renders nothing outside such a panel.
-->
<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type HandleProps = HTMLButtonAttributes;
</script>

<script lang="ts">
	import { getGroup, getGrip, getReorder } from './internal.js';

	let {
		'aria-label': ariaLabel,
		children,
		onkeydown,
		onpointerdown,
		style,
		type = 'button',
		...rest
	}: HandleProps = $props();

	const { axes } = getGroup();
	const grip = getGrip();
	const reordering = getReorder();

	const live = $derived(grip && grip.value !== undefined ? reordering.current : null);
	const named = $derived(
		typeof grip?.value === 'string' || typeof grip?.value === 'number'
			? `Move ${grip.value}`
			: 'Move panel'
	);

	const moveByKey = (event: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		onkeydown?.(event);
		if (!grip || !live) {
			return;
		}
		const step = event.key === axes.grow ? 1 : event.key === axes.shrink ? -1 : 0;
		const rtl = axes.point === 'x' && getComputedStyle(event.currentTarget).direction === 'rtl';
		const { order } = live;
		const from = order.indexOf(grip.value);
		const to = from + step * (rtl ? -1 : 1);
		if (step === 0 || from === -1 || to < 0 || to >= order.length) {
			return;
		}
		event.preventDefault();
		const next = [...order];
		[next[from], next[to]] = [next[to], next[from]];
		live.onOrderChange(next);
	};

	const carry = (event: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		onpointerdown?.(event);
		grip?.start(event);
	};
</script>

{#if live}
	<button
		aria-label={ariaLabel ?? named}
		{type}
		style="cursor: grab; touch-action: none; {style ?? ''}"
		onkeydown={moveByKey}
		onpointerdown={carry}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}
