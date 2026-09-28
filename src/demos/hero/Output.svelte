<script lang="ts">
	import { HIDDEN, rise } from './rise.js';

	const OUTPUT = [
		'$ bun add svelte-motion-panels',
		'installed svelte-motion-panels',
		'done in 0.4s'
	];
</script>

<div class="py-2">
	<ul class="list-none" {@attach rise}>
		{#each OUTPUT as line, row (line)}
			<li
				style={HIDDEN}
				class="flex px-3 font-mono text-[12px] leading-[1.7] whitespace-pre text-muted-foreground"
			>
				{#if row === 0}<span class="text-foreground/80">{line}</span>{:else}{line}{/if}
			</li>
		{/each}
	</ul>
</div>
