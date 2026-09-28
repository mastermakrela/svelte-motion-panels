<!--
A styled separator: a hairline on the seam and a small grip box in the middle,
both drawn with pseudo-elements on the Separator itself.
-->
<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	import { COMPACT, Card, Demo, Editor, FILES, Rows, px } from './shared/index.js';

	const compact = new MediaQuery(COMPACT, false);
	let width = $derived(compact.current ? 130 : 240);
</script>

<Demo>
	<Group orientation="horizontal">
		<Panel bind:size={width} minSize="20%" maxSize="55%">
			<Card label="Files" size={px(width)}>
				<Rows items={FILES} active="Panel.svelte" />
			</Card>
		</Panel>
		<Separator class="styled-separator" />
		<Panel>
			<Editor />
		</Panel>
	</Group>
</Demo>

<style>
	:global {
		.styled-separator {
			position: relative;
			z-index: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 12px;
			outline: none;
		}

		/* The hairline on the seam. */
		.styled-separator::after {
			position: absolute;
			inset-block: 0;
			width: 1px;
			background: var(--border);
			content: '';
			transition: background-color 150ms;
		}

		/* The grip box: six dots drawn with a background pattern. */
		.styled-separator::before {
			z-index: 1;
			box-sizing: border-box;
			width: 12px;
			height: 16px;
			border: 1px solid var(--border);
			border-radius: 2px;
			padding: 1px;
			background:
				radial-gradient(circle, var(--muted-foreground) 0.8px, transparent 1.1px) 0 0 / 4px 4px
					content-box,
				var(--card);
			content: '';
		}

		.styled-separator:is(:hover, [data-crossing])::after {
			background: var(--muted-foreground);
		}

		.styled-separator[data-resizing]::after {
			background: var(--foreground);
		}

		.styled-separator:focus-visible {
			box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
		}
	}
</style>
