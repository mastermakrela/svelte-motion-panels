<script lang="ts">
	// Not under (site): its sticky, blurred header would repaint over the frames
	// and perturb the measurements. Same tokens, plain static bar.
	import '../../app.css';

	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<header class="border-b">
	<div
		class="mx-auto flex h-14 w-full max-w-[1220px] items-center justify-between gap-8 px-5 min-[900px]:px-8"
	>
		<a
			href={resolve('/')}
			data-sveltekit-reload
			class="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] text-foreground no-underline"
		>
			<svg aria-hidden="true" fill="none" height="14" viewBox="0 0 20 14" width="20">
				<rect class="fill-accent" height="14" width="4" x="0" />
				<rect fill="currentColor" height="14" opacity="0.5" width="4" x="6" />
				<rect fill="currentColor" height="14" opacity="0.25" width="7" x="13" />
			</svg>
			<span><span class="text-accent">svelte</span>-motion-panels</span>
		</a>
		<span class="kicker text-muted-foreground">Benchmark</span>
	</div>
</header>
{@render children()}
