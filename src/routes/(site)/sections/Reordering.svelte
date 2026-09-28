<script lang="ts">
	import Prose from '../Prose.svelte';
	import ReorderDemo from '../../../demos/ReorderDemo.svelte';
	import raw from '../../../demos/ReorderDemo.svelte?raw';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { ASIDE } from '../prose.js';
	import Section from '../Section.svelte';
</script>

<Section
	id="reordering"
	title="Reordering"
	lead="Grab the dots in a panel header and carry the panel across: the two sides trade places and travel there. Give the group the `order` it should read and an `onOrderChange` callback, give each movable panel its `value`, and put a `Handle` inside it. The order lives in your state, so it is yours to persist."
>
	<ReorderDemo />
	<CodeBlock code={source(raw)} title="ReorderDemo.svelte" />
	<p class={ASIDE}>
		<Prose
			text={'Render the row with one keyed `{#each}`, sides and seams included. A reorder then swaps two keys, and Svelte moves the two existing panel elements instead of creating new ones, which is what the trip animates. The filling panel carries no value, and that is the whole rule: a group holds at most one sized panel on each side of it, so the panels that move are the ones you name in `order`. The middle card shows no dots, because `Handle` renders nothing inside a panel the group does not move. Handles are buttons: focus one and the arrow keys along the group axis move the panel too.'}
		/>
	</p>
</Section>
