<script lang="ts">
	import { HIDDEN, rise } from './rise.js';

	const TREE = [
		{ name: 'lib', nest: false },
		{ name: 'Group.svelte', nest: true },
		{ name: 'Panel.svelte', nest: true, open: true },
		{ name: 'Separator.svelte', nest: true },
		{ name: 'index.ts', nest: false }
	];
</script>

<div class="p-2">
	<ul class="list-none" {@attach rise}>
		{#each TREE as { name, nest, open } (name)}
			<li
				style={HIDDEN}
				class={[
					'flex items-center gap-2 overflow-hidden px-2 py-[3px] text-[12px] whitespace-nowrap',
					open ? 'bg-muted text-foreground' : 'text-muted-foreground',
					nest && 'pl-4'
				]}
			>
				<span class={['size-1 flex-none', open ? 'bg-foreground' : 'bg-muted-foreground/40']}
				></span>
				{name}
			</li>
		{/each}
	</ul>
</div>
