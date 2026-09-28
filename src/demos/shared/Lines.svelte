<script lang="ts">
	let { lines, terminal = false }: { lines: string[]; terminal?: boolean } = $props();
</script>

<ol class="list-none overflow-hidden py-2.5">
	{#each lines as line, row (row)}
		<li
			class="flex gap-3 px-3 font-mono text-[12px] leading-[1.75] whitespace-pre text-muted-foreground"
		>
			{#if !terminal}
				<span class="min-w-3.5 flex-none text-right text-muted-foreground/50 tabular-nums"
					>{row + 1}</span
				>
			{/if}
			{line}
		</li>
	{/each}
</ol>
