<!--
@component
A row of pressable buttons where exactly one is pressed.
-->
<script lang="ts" generics="T extends string">
	let {
		items,
		label,
		value = $bindable()
	}: { items: readonly T[]; label: string; value: T } = $props();
</script>

<div role="group" aria-label={label} class="flex flex-wrap items-center gap-0.5">
	{#each items as item (item)}
		<button
			type="button"
			aria-pressed={item === value}
			class="inline-flex h-9 min-w-9 items-center justify-center px-4 text-xs font-semibold tracking-widest whitespace-nowrap text-muted-foreground uppercase transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 aria-pressed:bg-muted aria-pressed:text-foreground"
			onclick={() => (value = item)}
		>
			{item}
		</button>
	{/each}
</div>
