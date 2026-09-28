<script lang="ts">
	const CODE = [
		'<script lang="ts">',
		'  let width = $state(288)',
		// Spelled out in parts: a literal closing script tag would end this block.
		`<${'/'}script>`,
		'',
		'<Group>',
		'  <Panel bind:size={width}>',
		'    <Files />',
		'  </Panel>',
		'  <Separator />',
		'  <Panel pin>',
		'    <Editor />',
		'  </Panel>',
		'</Group>'
	];

	const CARET = 5;

	const KEYWORD = /^(?:export|function|const|let|return|import|from|script)$/u;

	const tone = (token: string) => {
		if (KEYWORD.test(token) || token.startsWith('$')) {
			return 'text-foreground';
		}
		if (/^["']/u.test(token)) {
			return 'text-muted-foreground';
		}
		if (/^[A-Z]/u.test(token)) {
			return 'text-foreground/70';
		}
		if (/^[a-z]/u.test(token)) {
			return 'text-muted-foreground/85';
		}

		return 'text-muted-foreground/45';
	};

	const rows = CODE.map((line) => line.split(/([\s<>{}()[\]=/,:]+)/u));
</script>

<div class="py-2.5">
	{#each rows as tokens, row (row)}
		<div
			class={[
				'flex gap-3 px-3 font-mono text-[12px] leading-[1.75] whitespace-pre',
				row === CARET && 'bg-foreground/[0.045]'
			]}
		>
			<span class="w-3.5 flex-none text-right text-muted-foreground/35 tabular-nums">{row + 1}</span
			>
			<span>
				{#each tokens as token, index (index)}<span class={tone(token)}>{token}</span>{/each}
				{#if row === CARET}
					<span
						class="motion-loop ml-px inline-block h-[13px] w-[6px] translate-y-[2px] bg-foreground/70"
						style="animation: blink 1.1s linear infinite"
					></span>
				{/if}
			</span>
		</div>
	{/each}
</div>
