<script lang="ts">
	import Prose from '../Prose.svelte';
	import CoreDemo from '../../../demos/CoreDemo.svelte';
	import raw from '../../../demos/CoreDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { ASIDE, LEAD } from '../prose.js';
	import Reference from '../Reference.svelte';
	import Section from '../Section.svelte';
	import Subheading from '../Subheading.svelte';

	const EXTRAS = `import type { PanelController, PanelGroup, PanelOptions } from 'motion-panels'
import { reorder } from 'motion-panels'

export function wireExtras(controller: PanelController, options: PanelOptions, content: HTMLElement, toggle: HTMLElement) {
  let collapsed = false

  toggle.addEventListener('click', () => {
    collapsed = !collapsed
    controller.sync({ ...options, collapsed })
  })

  controller.motion.content.on('change', (value) => {
    content.style.width = \`\${value}px\`
  })
}

export function move(root: HTMLElement, axes: PanelGroup['axes'], change: () => void) {
  const before = reorder.measure(root, axes)
  change()
  reorder.play(before, axes)
}`;
</script>

<Section
	id="core"
	title="Core, without Svelte"
	lead="The demo below renders no components: one attachment builds a group and a panel from the `motion-panels` core and wires them to plain DOM nodes it creates itself. Same bounds, same keyboard. Drag the seam, or focus the grip and use the arrows. This is the whole surface an adapter for another framework has to cover, and it is what this adapter is built on."
>
	<CoreDemo />
	<CodeBlock code={source(raw)} title="CoreDemo.svelte" />
	<p class={ASIDE}>
		<Prose
			text="`attach` reads the panel's place in the group (which side of the filling panel it sits on, and so which edge drags) and returns the detach. `attachSeparator` wires the separator: pointer drags and crossings, keyboard, double-click reset, and the live aria-value and data attributes. `sync` feeds the panel new options on every state change, the same call the Svelte Panel makes from an effect. Everything else is state you already own."
		/>
	</p>
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
	<Subheading>Folds and reorders</Subheading>
	<p class="{LEAD} mt-3">
		The demo above stops at a drag. A fold is one sync away, and a reorder is two calls around the
		DOM change: measure the children before, play the trip after.
	</p>
	<CodeBlock lang="ts" code={EXTRAS} title="extras.ts" />
</Section>
