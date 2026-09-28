<script lang="ts">
	import BothEdgesDemo from '../../../demos/BothEdgesDemo.svelte';
	import raw from '../../../demos/BothEdgesDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="both-edges"
	title="Panels on both edges"
	lead="Each sized panel finds its own side: one before the filling panel drags on its end edge, one after it on its start edge. Two sized panels around one filling panel need no extra wiring, and again no separators. These two are percentages and stay percentages: a drag writes one back through `bind:size`, so they keep following the group."
>
	<BothEdgesDemo />
	<CodeBlock code={source(raw)} title="BothEdgesDemo.svelte" />
</Section>
