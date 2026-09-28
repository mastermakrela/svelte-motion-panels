<script lang="ts">
	import Prose from '../Prose.svelte';
	import FoldDemo from '../../../demos/FoldDemo.svelte';
	import raw from '../../../demos/FoldDemo.svelte?raw';
	import folds from '../../../demos/shared/folds.ts?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { ASIDE } from '../prose.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="collapsing"
	title="Collapsing and folds"
	lead="A collapsed panel folds to zero, and the fold is yours to design: `transition` times the panel edge, and the content brings its own Svelte `in:` transition. Pick a preset and toggle. Binding `collapsed` also turns on drag below half the minimum and Enter on the separator: focus the grip and press Enter."
>
	<FoldDemo />
	<p class={ASIDE}>
		<Prose
			text={'Svelte has no motion poses, so there is no `initial` or `animate` on a Panel. With `keepMounted={false}` the content unmounts once the fold closes and mounts again as it opens, which is when its `in:` transition plays. Leave `keepMounted` on (the default) and the content stays mounted, clipped at zero: reopening costs no mount, and nothing enters. The content is anchored to the edge facing the filling panel, so `origin-right` pins a scale or a flip to that edge.'}
		/>
	</p>
	<CodeBlock code={source(raw)} title="FoldDemo.svelte" />
	<CodeBlock lang="ts" code={folds} title="shared/folds.ts" />
</Section>
