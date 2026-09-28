<script lang="ts">
	import HorizontalDemo from '../../../demos/HorizontalDemo.svelte';
	import raw from '../../../demos/HorizontalDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="quick-start"
	title="Quick start"
	lead="A group is a flex container. A panel with a `size` holds it, a panel without one fills what is left. That is the whole layout. A size is pixels, or a percentage of the group that follows it as it resizes, and `bind:size` writes back whichever form it was given. No separator here: a sized panel is draggable by the edge facing the filling panel, so grab the seam below and pull."
>
	<HorizontalDemo />
	<CodeBlock code={source(raw)} title="HorizontalDemo.svelte" />
</Section>
