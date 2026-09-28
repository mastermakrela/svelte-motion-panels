<script lang="ts">
	let { active, items }: { active?: string; items: string[] } = $props();
</script>

<ul class="list-none overflow-hidden p-2">
	{#each items as item (item)}
		<li
			data-active={item === active || undefined}
			class="flex items-center gap-2 overflow-hidden px-2 py-[3px] text-[12px] text-ellipsis whitespace-nowrap text-muted-foreground before:size-1 before:flex-none before:bg-muted-foreground/40 data-active:bg-muted data-active:text-foreground data-active:before:bg-foreground"
		>
			{item}
		</li>
	{/each}
</ul>
