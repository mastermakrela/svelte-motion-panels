<!--
@component
A size readout that springs to each new value, written straight to the text
node so a drag never re-renders anything.
-->
<script lang="ts">
	import { motionValue, springValue } from 'motion';
	import { onDestroy, untrack } from 'svelte';

	let { folded, value }: { folded: boolean; value: number } = $props();

	const target = motionValue(untrack(() => value));
	const spring = springValue(target, { damping: 30, stiffness: 320 });
	const first = untrack(() => Math.round(value));

	$effect(() => {
		target.set(value);
	});

	onDestroy(() => spring.destroy());
</script>

<span
	class="font-mono text-[10px] tracking-normal normal-case text-muted-foreground/50 tabular-nums"
>
	{#if folded}
		folded
	{:else}
		<span
			{@attach (element) => {
				const write = (size: number) => (element.textContent = `${Math.round(size)}px`);
				write(spring.get());

				return spring.on('change', write);
			}}>{first}px</span
		>
	{/if}
</span>
