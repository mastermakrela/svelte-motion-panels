<script lang="ts">
	import PinDemo from '../../../demos/PinDemo.svelte';
	import raw from '../../../demos/PinDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { ASIDE } from '../prose.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="pinning"
	title="Pinning"
	lead="A filling panel reflows its content on every frame of a fold. A pinned one sizes the content once, up front, and anchors it to the edge that is not moving, so the content holds still while the fold slides the panel edge across it. Toggle the pin off and watch the paragraph rewrap the whole way through."
>
	<PinDemo />
	<p class={ASIDE}>
		Pin content that bleeds to its own edges: an editor, a document, a table. A block with its own
		border or rounded corners shows that edge jumping instead, which is why the paragraph here has
		no frame of its own. The anchor follows the fold, so a sized panel placed after the filling one
		pins to the start edge instead.
	</p>
	<CodeBlock code={source(raw)} title="PinDemo.svelte" />
</Section>
