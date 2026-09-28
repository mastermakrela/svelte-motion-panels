<script lang="ts">
	import Prose from '../Prose.svelte';
	import { API } from '../api.js';
	import { LEAD } from '../prose.js';
	import Reference from '../Reference.svelte';
	import Section from '../Section.svelte';
</script>

<Section
	id="api"
	title="API"
	lead="Every component forwards the rest of its props to its element, `class` included. Content is a `children` snippet."
>
	{#each API as component (component.name)}
		<div class="mt-10">
			<h3 class="font-mono text-[14px] font-medium text-foreground">{component.name}</h3>
			{#if component.note}
				<p class="{LEAD} mt-2"><Prose text={component.note} /></p>
			{/if}
			{#if component.props.length > 0}
				<Reference head={['Prop', 'Type', 'Does']} rows={component.props} />
			{/if}
		</div>
	{/each}
</Section>
