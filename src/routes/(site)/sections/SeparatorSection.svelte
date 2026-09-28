<script lang="ts">
	import SeparatorDemo from '../../../demos/SeparatorDemo.svelte';
	import raw from '../../../demos/SeparatorDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import Reference from '../Reference.svelte';
	import Section from '../Section.svelte';
</script>

<Section
	id="separator"
	title="Separator"
	lead="Drop a `Separator` between two panels and the same split gains a visible grip, keyboard control and double-click reset. It finds the sized panel next to it, resizes that one, and sits centred on the seam without taking space in the flow. It is a focusable `[role='separator']` carrying the panel size on `aria-valuenow`."
>
	<SeparatorDemo />
	<Reference
		head={['Key', 'Does']}
		rows={[
			['Arrows', 'Grow or shrink by 10px, along the group axis'],
			['Shift + arrows', 'The same, by 50px'],
			['Page up / Page down', 'The same, by 50px, without a modifier'],
			['Home / End', 'Jump to minSize or maxSize'],
			['Enter', 'Toggle collapsed (needs bind:collapsed or onCollapsedChange)'],
			['Double-click', 'Reset to defaultSize, or to the size the panel mounted with']
		]}
	/>
	<CodeBlock code={source(raw)} title="SeparatorDemo.svelte" />
</Section>
