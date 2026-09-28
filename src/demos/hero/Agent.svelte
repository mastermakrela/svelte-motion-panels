<script lang="ts">
	import { HIDDEN, rise } from './rise.js';

	const TURNS = [
		{ from: 'you', text: 'Make the file tree collapsible.' },
		{ from: 'agent', text: 'Bound collapsed on the Files panel.' },
		{ from: 'agent', text: 'Enter on its separator toggles it now.' }
	];
</script>

<div class="flex flex-col gap-3 p-2.5">
	<ul class="list-none" {@attach rise}>
		{#each TURNS as { from, text } (text)}
			<li style={HIDDEN} class="mb-3 last:mb-0">
				<span class="kicker text-muted-foreground/50">{from}</span>
				<p
					class={[
						'mt-1 text-[12px] leading-[1.55]',
						from === 'agent' ? 'text-muted-foreground' : 'text-foreground'
					]}
				>
					{text}
				</p>
			</li>
		{/each}
	</ul>
	<div class="flex gap-1 px-2.5 pt-1">
		{#each [0, 1, 2] as dot (dot)}
			<span
				class="motion-loop size-1 rounded-full bg-muted-foreground"
				style="animation: breathe 1.2s {dot * 0.16}s infinite"
			></span>
		{/each}
	</div>
</div>
