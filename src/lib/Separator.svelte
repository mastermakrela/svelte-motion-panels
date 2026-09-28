<!--
@component
The grip between two panels. Drag it, focus it and use the arrow keys, or
double-click it to reset. The core writes `aria-valuenow`, `data-resizing` and
`data-crossing` on the grip; style those.
-->
<script lang="ts" module>
	import type { PanelController } from 'motion-panels';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';

	export type SeparatorProps = HTMLAttributes<HTMLDivElement>;

	/** Internal: a sized panel renders its own edge grip when nothing separates it. */
	export type GripProps = SeparatorProps & { end?: boolean; own?: PanelController };
</script>

<script lang="ts">
	import { attachSeparator } from 'motion-panels';

	import { getGroup } from './internal.js';

	let {
		'aria-label': ariaLabel = 'Resize panel',
		end,
		own,
		style,
		tabindex = 0,
		...rest
	}: GripProps = $props();

	const group = getGroup();
	const { axes } = group;
	// Constant for the life of the group, so this style string never changes.
	const slot = `display: flex; flex-direction: ${axes.direction}; justify-content: center; ${axes.extent}: 0;`;
	const inset = $derived(`inset-${axes.axis.toLowerCase()}-${end ? 'end' : 'start'}`);
	const across = `inset-${axes.crossAxis.toLowerCase()}`;

	// A separator coming or going changes which panels have a grip, so the
	// panels re-place themselves (React gets this from syncing on every render).
	// A panel's own edge grip sits inside it and changes no neighbour.
	const attach: Attachment<HTMLElement> = (element) => {
		const detach = attachSeparator(element, group, own);
		if (!own) {
			group.notify();
		}

		return () => {
			detach();
			if (!own) {
				group.notify();
			}
		};
	};
</script>

{#snippet grip()}
	<!-- A div, not an hr: an hr is void, so it can not be focused or hold the grip line.
	     A focusable separator is a widget (it carries aria-valuenow), so the tabindex is meant. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		{...rest}
		role="separator"
		{tabindex}
		aria-label={ariaLabel}
		aria-orientation={axes.separator}
		style="cursor: {axes.cursor}; flex-shrink: 0; touch-action: none; {style ?? ''}"
		{@attach attach}
	></div>
{/snippet}

{#if own}
	<div style="{slot} position: absolute; {inset}: 0; {across}: 0;">
		{@render grip()}
	</div>
{:else}
	<div data-motion-panels-separator style="{slot} flex: none;">
		{@render grip()}
	</div>
{/if}
