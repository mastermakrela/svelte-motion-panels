<script lang="ts">
	import Prose from '../Prose.svelte';
	import StyledDemo from '../../../demos/StyledDemo.svelte';
	import styled from '../../../demos/StyledDemo.svelte?raw';
	import ToggleGroup from '../../../demos/ui/ToggleGroup.svelte';
	import CodeBlock from '../CodeBlock.svelte';
	import { source } from '../highlight.js';
	import { LEAD } from '../prose.js';
	import Section from '../Section.svelte';
	import Subheading from '../Subheading.svelte';

	const MANAGERS = ['bun', 'npm', 'pnpm'] as const;
	const COMMAND = { bun: 'bun add', npm: 'npm install', pnpm: 'pnpm add' };

	let manager = $state<(typeof MANAGERS)[number]>('bun');

	const IMPORTS = `import { Group, Handle, Panel, Separator } from 'svelte-motion-panels'

// The framework-free core underneath, if you want it directly:
import { createPanel, createPanelGroup } from 'motion-panels'`;
</script>

<Section
	id="install"
	title="Install"
	lead="`svelte-motion-panels` is the components: Group, Panel, Separator and Handle, written with runes for Svelte 5. It depends on `motion-panels`, the framework-free resizing engine, and takes `motion` as a peer, so you install that next to it."
>
	<div class="mt-6">
		<ToggleGroup label="Package manager" items={MANAGERS} bind:value={manager} />
	</div>
	<div class="-mt-3">
		<CodeBlock lang="sh" code="{COMMAND[manager]} svelte-motion-panels motion" />
	</div>
	<CodeBlock lang="ts" code={IMPORTS} />

	<Subheading>A styled separator</Subheading>
	<p class="{LEAD} mt-4">
		<Prose
			text="Upstream ships a shadcn registry item for React. There is no Svelte registry, but the separator is one element with `role='separator'`, so a styled one is a class away: a hairline on the seam and a small grip box, both pseudo-elements. Copy it into your project and it is yours to edit."
		/>
	</p>
	<StyledDemo />
	<CodeBlock code={source(styled)} title="StyledDemo.svelte" />
</Section>
