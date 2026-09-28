<script lang="ts">
	import Check from 'phosphor-svelte/lib/Check';
	import Copy from 'phosphor-svelte/lib/Copy';

	import Button from '../../demos/ui/Button.svelte';

	let { label = 'Copy', text }: { label?: string; text: string } = $props();

	let copied = $state(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// The browser blocked the clipboard; nothing useful to say in a 28px button.
		}
	};
</script>

<Button aria-label={copied ? 'Copied' : label} size="icon-xs" variant="ghost" onclick={copy}>
	{#if copied}
		<Check size={14} weight="bold" />
	{:else}
		<Copy size={14} />
	{/if}
</Button>
