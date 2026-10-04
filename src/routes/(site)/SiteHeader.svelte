<script lang="ts">
	import { resolve } from '$app/paths';
	import GithubLogo from 'phosphor-svelte/lib/GithubLogo';

	import ThemeToggle from './ThemeToggle.svelte';

	const LINK =
		'kicker text-muted-foreground no-underline outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';
</script>

<header class="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
	<div class="mx-auto flex h-14 w-full max-w-[1220px] items-center gap-8 px-5 min-[900px]:px-8">
		<a
			href={resolve('')}
			class="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] text-foreground no-underline"
		>
			<svg aria-hidden="true" fill="none" height="14" viewBox="0 0 20 14" width="20">
				<rect class="fill-accent" height="14" width="4" x="0" />
				<rect fill="currentColor" height="14" opacity="0.5" width="4" x="6" />
				<rect fill="currentColor" height="14" opacity="0.25" width="7" x="13" />
			</svg>
			<span><span class="text-accent">svelte</span>-motion-panels</span>
		</a>

		<nav aria-label="Site" class="ml-auto hidden items-center gap-7 min-[760px]:flex">
			<a class={LINK} href="#install">Docs</a>
			<a class={LINK} href="#api">API</a>
			<a class={LINK} href={resolve('bench')} data-sveltekit-reload>Benchmark</a>
			<a
				class={LINK}
				href="https://www.npmjs.com/package/svelte-motion-panels"
				rel="noreferrer"
				target="_blank">npm</a
			>
		</nav>

		<div class="ml-auto flex items-center gap-1 min-[760px]:ml-0">
			<ThemeToggle />
			<a
				href="https://github.com/mastermakrela/svelte-motion-panels"
				rel="noreferrer"
				target="_blank"
				aria-label="GitHub"
				class="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
			>
				<GithubLogo size={18} weight="fill" />
			</a>
		</div>
	</div>
</header>
