<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	import { highlight, type Lang } from './highlight.js';

	let { code, lang = 'svelte', title }: { code: string; lang?: Lang; title?: string } = $props();

	const LABEL = { css: 'css', sh: 'shell', svelte: 'svelte', ts: 'ts' };

	const text = $derived(code.trim());
	const tokens = $derived(highlight(text, lang));
</script>

<div class="mt-6 overflow-hidden border bg-code">
	<div
		class="flex h-9 items-center justify-between gap-2 border-b pr-1 pl-3.5 text-muted-foreground"
	>
		<span class="kicker">{title ?? LABEL[lang]}</span>
		<CopyButton {text} />
	</div>
	<pre
		class="m-0 max-h-[34rem] overflow-auto px-4 py-4 font-mono text-[13px] leading-[1.7] [tab-size:2]"><code
			>{#each tokens as [kind, part], index (index)}<span class="tok-{kind}">{part}</span
				>{/each}</code
		></pre>
</div>
