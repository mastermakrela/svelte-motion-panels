<script lang="ts">
	import HeroDemo from '../../demos/HeroDemo.svelte';
	import CopyButton from './CopyButton.svelte';

	const INSTALL = 'bun add svelte-motion-panels motion';
</script>

<section class="border-b">
	<div
		class="mx-auto grid w-full max-w-[1220px] items-center gap-10 px-5 pt-14 pb-16 min-[900px]:px-8 min-[1000px]:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] min-[1000px]:gap-14 min-[1000px]:pt-20 min-[1000px]:pb-24"
	>
		<div>
			<h1
				class="text-[clamp(32px,4.4vw,46px)] leading-[1.08] font-medium tracking-[-0.035em] text-balance"
			>
				Resizable panels for Svelte, animated with Motion
			</h1>
			<p class="mt-6 max-w-[46ch] text-[16px] text-pretty text-muted-foreground">
				A Svelte 5 adapter built on the
				<a
					class="text-foreground underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
					href="https://motion-panels.letstri.dev"
					rel="noreferrer"
					target="_blank">motion-panels</a
				>
				core by Valerii Strilets, and inspired by the original motion-panels site. Drag a panel by its
				edge or add a separator. The panels next to this text are the real thing.
			</p>
			<div class="mt-9 flex flex-wrap items-center gap-3">
				<a
					href="#quick-start"
					class="inline-flex h-10 items-center bg-accent px-6 text-xs font-semibold tracking-widest text-white uppercase no-underline dark:text-background transition-colors hover:bg-[color-mix(in_oklab,var(--accent),black_12%)] focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px"
				>
					Quick start
				</a>
				<div class="flex h-10 items-center gap-1 border pr-1 pl-3.5">
					<code class="font-mono text-[13px] text-muted-foreground">{INSTALL}</code>
					<CopyButton text={INSTALL} label="Copy install command" />
				</div>
			</div>
		</div>
		<HeroDemo />
	</div>
</section>
