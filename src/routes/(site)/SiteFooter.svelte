<script lang="ts">
	import { resolve } from '$app/paths';

	const LINK =
		'text-foreground underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent';
</script>

<footer class="border-t">
	<div
		class="mx-auto flex w-full max-w-[1220px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-10 text-[13px] text-muted-foreground min-[900px]:px-8"
	>
		<p>
			Built on <a
				class={LINK}
				href="https://motion-panels.letstri.dev"
				rel="noreferrer"
				target="_blank">motion-panels</a
			>
			by Valerii Strilets (<a
				class={LINK}
				href="https://github.com/letstri/motion-panels"
				rel="noreferrer"
				target="_blank">MIT</a
			>). The docs and demos on this page follow the original motion-panels site.
		</p>
		<div class="flex flex-wrap items-center gap-x-6 gap-y-2">
			<a
				class="kicker no-underline transition-colors hover:text-foreground"
				href={resolve('/bench')}
				data-sveltekit-reload>Benchmark</a
			>
			<a
				class="kicker no-underline transition-colors hover:text-foreground"
				href="https://github.com/letstri/motion-panels"
				rel="noreferrer"
				target="_blank">letstri/motion-panels</a
			>
			<a
				class="kicker no-underline transition-colors hover:text-foreground"
				href="https://github.com/mastermakrela/svelte-motion-panels"
				rel="noreferrer"
				target="_blank">mastermakrela/svelte-motion-panels</a
			>
		</div>
	</div>
</footer>
