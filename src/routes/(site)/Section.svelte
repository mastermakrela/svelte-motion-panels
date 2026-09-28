<script lang="ts">
	import Prose from './Prose.svelte';
	import type { Snippet } from 'svelte';

	import { LEAD } from './prose.js';

	let {
		children,
		id,
		lead,
		title
	}: { children: Snippet; id: string; lead: string; title: string } = $props();
</script>

<section
	{id}
	class="scroll-mt-20 border-t pt-14 [counter-increment:section] first:border-t-0 first:pt-0"
>
	<span
		class="kicker text-accent/70 before:content-[counter(section,decimal-leading-zero)]"
		aria-hidden="true"
	></span>
	<h2
		class="mt-3 text-[26px] leading-[1.15] font-medium tracking-[-0.025em] text-balance min-[900px]:text-[30px]"
	>
		{title}
	</h2>
	<p class="{LEAD} mt-4"><Prose text={lead} /></p>
	{@render children()}
</section>
