<script lang="ts">
	import Moon from 'phosphor-svelte/lib/Moon';
	import Sun from 'phosphor-svelte/lib/Sun';

	import Button from '../../demos/ui/Button.svelte';

	// The theme script in app.html already put the right class on <html>; the
	// icons follow it through CSS, so nothing here depends on it at render.
	const toggle = () => {
		const dark = document.documentElement.classList.toggle('dark');
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// Storage blocked: the choice lasts for this page only.
		}
	};
</script>

<Button aria-label="Toggle theme" size="icon-sm" variant="ghost" onclick={toggle}>
	<Moon size={16} class="dark:hidden" />
	<Sun size={16} class="hidden dark:block" />
</Button>
