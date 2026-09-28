<script lang="ts">
	import { CHIP, LEAD } from '../prose.js';
	import Reference from '../Reference.svelte';
	import Section from '../Section.svelte';
	import Subheading from '../Subheading.svelte';

	const LINK =
		'text-foreground underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent';
</script>

<Section
	id="under-the-hood"
	title="Under the hood"
	lead="The components are a thin binding over the framework-free `motion-panels` core by Valerii Strilets. The core owns the numbers: bounds, drags, keyboard, folds, crossings, RTL and aria. It hands back motion values, and the adapter owns the DOM."
>
	<Subheading>What every element needs</Subheading>
	<p class="{LEAD} mt-3">
		The core owns numbers, never nodes. It reads one attribute and hands back motion values and a
		state object; laying the flexbox out is the adapter's half of the deal. This is that half, in
		full.
	</p>
	<Reference
		head={['Element', 'What you give it']}
		rows={[
			[
				'group root',
				'display: flex, flex-direction from axes.direction, and overflow: clip on the outermost group.'
			],
			[
				'filling panel',
				'The FILL_ATTRIBUTE plus flex: 1 and a zero min-width or min-height. Every sized panel finds its own side by looking for this one.'
			],
			['sized panel', 'flex-shrink: 0 and its extent from motion.size, floored at 0.'],
			[
				'panel content',
				'flex-shrink: 0, 100% on the cross axis, and its extent from motion.content: the value that holds a layout still while the panel edge slides across it.'
			],
			[
				'separator',
				"role='separator', tabIndex, aria-orientation from axes.separator, touch-action: none, and attachSeparator. It writes aria-valuenow, data-resizing and data-crossing itself."
			],
			[
				'pinned fill',
				'A flex wrapper with justify-content from group.fill.anchor, and the child sized by group.fill.size. Both are motion values the folding panel drives.'
			]
		]}
	/>
	<p class="{LEAD} mt-6">
		The reorder drag is the one gesture written in this adapter, since vanilla <code class={CHIP}
			>motion</code
		>
		has no drag gesture; everything else calls the
		<a class={LINK} href="https://motion-panels.letstri.dev/#core" rel="noreferrer" target="_blank"
			>motion-panels core</a
		>.
	</p>
</Section>
