<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import Button from './Button.svelte';

	let {
		children,
		pressed = $bindable(false),
		...rest
	}: Omit<HTMLButtonAttributes, 'aria-pressed'> & { pressed?: boolean } = $props();
</script>

<Button
	{...rest}
	size="sm"
	variant="outline"
	aria-pressed={pressed}
	onclick={() => (pressed = !pressed)}
>
	{@render children?.()}
</Button>
