<script lang="ts">
	import DeepNestDemo from '../../../demos/DeepNestDemo.svelte';
	import deep from '../../../demos/DeepNestDemo.svelte?raw';
	import NestedDemo from '../../../demos/NestedDemo.svelte';
	import raw from '../../../demos/NestedDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { ASIDE } from '../prose.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="nesting"
	title="Nesting and intersections"
	lead="Groups nest: here a vertical split lives inside the filling panel of a horizontal one. Where the two seams meet, press near the crossing and both separators follow the pointer. The cursor turns to move and each one resizes its own panel. Nothing to add: any separator whose grip reaches the pointer joins the drag."
>
	<NestedDemo />
	<CodeBlock code={source(raw)} title="NestedDemo.svelte" />
	<p class={ASIDE}>
		Depth is not limited. Below, a horizontal split sits in the top panel of a vertical split, which
		sits in the filling panel of the outer row. Both crossings resize both axes: files with terminal
		at the left end of the terminal seam, outline with terminal at its right end. Two levels apart,
		and neither knows about the other.
	</p>
	<DeepNestDemo />
	<CodeBlock code={source(deep)} title="DeepNestDemo.svelte" />
</Section>
