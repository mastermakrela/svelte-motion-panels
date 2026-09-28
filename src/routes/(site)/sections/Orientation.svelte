<script lang="ts">
	import VerticalDemo from '../../../demos/VerticalDemo.svelte';
	import raw from '../../../demos/VerticalDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="orientation"
	title="Orientation"
	lead="The same split on the other axis. Nothing about the panel or the separator changes: the group decides the axis, the cursor, the separator orientation and which arrow keys grow it."
>
	<VerticalDemo />
	<CodeBlock code={source(raw)} title="VerticalDemo.svelte" />
</Section>
